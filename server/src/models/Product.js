import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
  },
  price: {
    type: Number,
    required: function() {
      return !this.hasVariants;
    },
    min: [0, 'Price cannot be negative'],
  },
  oldPrice: {
    type: Number,
    min: [0, 'Old price cannot be negative'],
    default: null,
  },
  promoPrice: {
    type: Number,
    min: [0, 'Promo price cannot be negative'],
    default: null,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required'],
  },
  images: [{
    type: String,
  }],
  stock: {
    type: Number,
    required: function() {
      return !this.hasVariants;
    },
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  featured: {
    type: Boolean,
    default: false,
  },
  // Variants support
  hasVariants: {
    type: Boolean,
    default: false,
  },
  variantAttributes: [{
    name: {
      type: String,
      required: true,
      trim: true,
    }, // e.g., "Color", "Size"
    values: [{
      type: String,
      trim: true,
    }], // e.g., ["Red", "Blue", "Green"] or ["S", "M", "L"]
  }],
  variants: [{
    attributes: {
      type: Map,
      of: String,
      required: true,
    }, // e.g., { "Color": "Red", "Size": "M" }
    image: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    promoPrice: {
      type: Number,
      min: [0, 'Promo price cannot be negative'],
      default: null,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
  }],
}, {
  timestamps: true,
});

// Index for search optimization
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
