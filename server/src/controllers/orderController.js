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

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
      });

      // Reduce stock
      product.stock -= item.quantity;
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
    res.status(500).json({
      success: false,
      message: 'Error creating order',
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
