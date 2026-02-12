import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Product name is required'],
    validate: {
      validator: function(v) {
        // Allow both old string format (backward compatibility) and new multilingual format
        if (typeof v === 'string') return true;
        if (typeof v === 'object' && v !== null) {
          return (v.fr && typeof v.fr === 'string') || (v.ar && typeof v.ar === 'string');
        }
        return false;
      },
      message: 'Product name must be a string or an object with fr and/or ar properties'
    }
  },
  description: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Product description is required'],
    validate: {
      validator: function(v) {
        // Allow both old string format (backward compatibility) and new multilingual format
        if (typeof v === 'string') return true;
        if (typeof v === 'object' && v !== null) {
          return (v.fr && typeof v.fr === 'string') || (v.ar && typeof v.ar === 'string');
        }
        return false;
      },
      message: 'Product description must be a string or an object with fr and/or ar properties'
    }
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
// Note: Text index works with string fields, so we'll need to handle multilingual search differently
productSchema.index({ tags: 'text' });

// Virtual for getting name as string (for backward compatibility)
productSchema.virtual('nameString').get(function() {
  if (typeof this.name === 'string') return this.name;
  if (typeof this.name === 'object' && this.name !== null) {
    return this.name.fr || this.name.ar || '';
  }
  return '';
});

// Virtual for getting description as string (for backward compatibility)
productSchema.virtual('descriptionString').get(function() {
  if (typeof this.description === 'string') return this.description;
  if (typeof this.description === 'object' && this.description !== null) {
    return this.description.fr || this.description.ar || '';
  }
  return '';
});

const Product = mongoose.model('Product', productSchema);

export default Product;
