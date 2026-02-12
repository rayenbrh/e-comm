import Order from '../models/Order.js';
import Product from '../models/Product.js';

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Public
 */
export const createOrder = async (req, res) => {
  try {
    const { items, guestInfo, notes } = req.body;
    const user = req.user ? req.user._id : null;

    // Validate guest info if user is not logged in
    if (!user) {
      if (!guestInfo) {
        return res.status(400).json({
          success: false,
          message: 'Guest information is required when not logged in',
        });
      }
      if (!guestInfo.name || !guestInfo.email || !guestInfo.phone || !guestInfo.address) {
        return res.status(400).json({
          success: false,
          message: 'Guest information is incomplete',
          errors: [
            ...(!guestInfo.name ? [{ field: 'guestInfo.name', message: 'Name is required' }] : []),
            ...(!guestInfo.email ? [{ field: 'guestInfo.email', message: 'Email is required' }] : []),
            ...(!guestInfo.phone ? [{ field: 'guestInfo.phone', message: 'Phone is required' }] : []),
            ...(!guestInfo.address ? [{ field: 'guestInfo.address', message: 'Address is required' }] : []),
          ],
        });
      }
      // Validate address fields
      if (!guestInfo.address.street || !guestInfo.address.city || !guestInfo.address.postalCode || !guestInfo.address.country) {
        return res.status(400).json({
          success: false,
          message: 'Address information is incomplete',
        });
      }
    }

    // Validate items and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      // Handle products with variants
      let selectedVariant = null;
      let itemPrice = 0;
      let itemStock = 0;
      let itemName = typeof product.name === 'string' ? product.name : (product.name?.fr || product.name?.ar || 'Product');

      if (product.hasVariants && product.variants && product.variants.length > 0) {
        // Products with variants require variant selection
        if (!item.variantAttributes || typeof item.variantAttributes !== 'object' || Object.keys(item.variantAttributes).length === 0) {
          return res.status(400).json({
            success: false,
            message: `Variant selection is required for product: ${itemName}`,
          });
        }

        // Find matching variant by attributes
        selectedVariant = product.variants.find(variant => {
          if (!variant.attributes) return false;
          const variantAttrs = variant.attributes instanceof Map 
            ? Object.fromEntries(variant.attributes) 
            : (variant.attributes || {});
          const itemAttrs = item.variantAttributes || {};
          
          // Check if all keys match
          const variantKeys = Object.keys(variantAttrs);
          const itemKeys = Object.keys(itemAttrs);
          
          if (variantKeys.length !== itemKeys.length) return false;
          
          return variantKeys.every(key => variantAttrs[key] === itemAttrs[key]);
        });

        if (!selectedVariant) {
          return res.status(400).json({
            success: false,
            message: `Variant not found for product: ${itemName}`,
          });
        }

        itemPrice = selectedVariant.promoPrice && selectedVariant.promoPrice > 0 
          ? selectedVariant.promoPrice 
          : selectedVariant.price;
        itemStock = selectedVariant.stock;
      } else {
        // Products without variants - use product price and stock
        if (product.price === undefined || product.price === null) {
          return res.status(400).json({
            success: false,
            message: `Product ${itemName} does not have a price`,
          });
        }
        itemPrice = product.promoPrice && product.promoPrice > 0 
          ? product.promoPrice 
          : product.price;
        itemStock = product.stock || 0;
      }

      // Check stock
      if (itemStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${itemName}. Available: ${itemStock}`,
        });
      }

      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      // Ensure name is a string (handle multilingual)
      const orderItemName = typeof itemName === 'string' ? itemName : String(itemName);
      
      orderItems.push({
        product: product._id,
        name: orderItemName,
        quantity: item.quantity,
        price: itemPrice,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
      });

      // Reduce stock
      if (product.hasVariants && selectedVariant) {
        // Update variant stock
        const variantIndex = product.variants.findIndex(v => {
          if (!v.attributes) return false;
          const variantAttrs = v.attributes instanceof Map 
            ? Object.fromEntries(v.attributes) 
            : (v.attributes || {});
          const itemAttrs = item.variantAttributes || {};
          
          const variantKeys = Object.keys(variantAttrs);
          const itemKeys = Object.keys(itemAttrs);
          
          if (variantKeys.length !== itemKeys.length) return false;
          
          return variantKeys.every(key => variantAttrs[key] === itemAttrs[key]);
        });
        
        if (variantIndex !== -1) {
          product.variants[variantIndex].stock -= item.quantity;
          // Mark variants array as modified for Mongoose
          product.markModified('variants');
        }
      } else {
        // Update product stock
        product.stock -= item.quantity;
      }
      
      await product.save();
    }

    // Calculate shipping (simple logic - can be enhanced)
    const shippingCost = subtotal > 100 ? 0 : 10;
    const total = subtotal + shippingCost;

    // Create order
    const orderData = {
      user,
      items: orderItems,
      subtotal,
      shippingCost,
      total,
      notes: notes || '',
      status: 'Pending',
    };

    // Add guest info if not logged in
    if (!user && guestInfo) {
      orderData.guestInfo = guestInfo;
    }

    const order = await Order.create(orderData);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    console.error('Error stack:', error.stack);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

/**
 * @route   GET /api/orders
 * @desc    Get all orders (admin) or user's orders
 * @access  Private
 */
export const getOrders = async (req, res) => {
  try {
    let query = {};

    // If not admin, only show user's orders
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    } else {
      // Admin can filter by status
      const { status, startDate, endDate } = req.query;

      if (status) {
        query.status = status;
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
    });
  }
};

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if user owns this order (unless admin)
    if (req.user.role !== 'admin' && order.user && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
    });
  }
};

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private/Admin
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
    });
  }
};

/**
 * @route   GET /api/orders/stats/overview
 * @desc    Get order statistics for admin dashboard
 * @access  Private/Admin
 */
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });

    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        totalRevenue,
        ordersByStatus,
      },
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics',
    });
  }
};
