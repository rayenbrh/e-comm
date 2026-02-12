import mongoose from 'mongoose';

const packSchema = new mongoose.Schema({
  name: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Pack name is required'],
    validate: {
      validator: function(v) {
        // Allow both old string format (backward compatibility) and new multilingual format
        if (typeof v === 'string') return true;
        if (typeof v === 'object' && v !== null) {
          return (v.fr && typeof v.fr === 'string') || (v.ar && typeof v.ar === 'string');
        }
        return false;
      },
      message: 'Pack name must be a string or an object with fr and/or ar properties'
    }
  },
  description: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Pack description is required'],
    validate: {
      validator: function(v) {
        // Allow both old string format (backward compatibility) and new multilingual format
        if (typeof v === 'string') return true;
        if (typeof v === 'object' && v !== null) {
          return (v.fr && typeof v.fr === 'string') || (v.ar && typeof v.ar === 'string');
        }
        return false;
      },
      message: 'Pack description must be a string or an object with fr and/or ar properties'
    }
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  }],
  originalPrice: {
    type: Number,
    required: [true, 'Original price is required'],
    min: [0, 'Price cannot be negative'],
  },
  discountPrice: {
    type: Number,
    required: [true, 'Discount price is required'],
    min: [0, 'Price cannot be negative'],
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: [0, 'Discount percentage cannot be negative'],
    max: [100, 'Discount percentage cannot exceed 100'],
  },
  image: {
    type: String,
    default: null,
  },
  active: {
    type: Boolean,
    default: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    default: null,
  },
  featured: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for active packs
packSchema.index({ active: 1, featured: 1 });

const Pack = mongoose.model('Pack', packSchema);

export default Pack;

