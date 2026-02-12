import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Category name is required'],
    validate: {
      validator: function(v) {
        // Allow both old string format (backward compatibility) and new multilingual format
        if (typeof v === 'string') return true;
        if (typeof v === 'object' && v !== null) {
          return (v.fr && typeof v.fr === 'string') || (v.ar && typeof v.ar === 'string');
        }
        return false;
      },
      message: 'Category name must be a string or an object with fr and/or ar properties'
    }
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  isSubCategory: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Auto-generate slug from name
categorySchema.pre('validate', function(next) {
  if (this.name && !this.slug) {
    // Handle multilingual name - use French name for slug, fallback to Arabic or string
    const nameString = typeof this.name === 'string' 
      ? this.name 
      : (this.name.fr || this.name.ar || 'category');
    this.slug = nameString
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Index for parent queries
categorySchema.index({ parent: 1 });
categorySchema.index({ isSubCategory: 1 });

const Category = mongoose.model('Category', categorySchema);

export default Category;
