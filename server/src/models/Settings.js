import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  value: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Ensure only one settings document exists
settingsSchema.statics.getSetting = async function(key, defaultValue = '') {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

settingsSchema.statics.setSetting = async function(key, value, description = '') {
  return await this.findOneAndUpdate(
    { key },
    { key, value, description },
    { upsert: true, new: true }
  );
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;

