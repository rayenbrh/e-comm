import Settings from '../models/Settings.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all settings
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.find({});
  
  // Convert to object format
  const settingsObj = {};
  settings.forEach(setting => {
    settingsObj[setting.key] = setting.value;
  });

  res.json({
    success: true,
    settings: settingsObj,
  });
});

// Get a specific setting
export const getSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const setting = await Settings.findOne({ key });

  if (!setting) {
    return res.json({
      success: true,
      value: '',
    });
  }

  res.json({
    success: true,
    value: setting.value,
  });
});

// Update or create a setting (admin only)
export const updateSetting = asyncHandler(async (req, res) => {
  const { key, value, description } = req.body;

  if (!key || value === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Key and value are required',
    });
  }

  const setting = await Settings.setSetting(key, value, description || '');

  res.json({
    success: true,
    message: 'Setting updated successfully',
    setting,
  });
});

// Get hero images (returns array)
export const getHeroImage = asyncHandler(async (req, res) => {
  const heroImagesJson = await Settings.getSetting('heroImages', '[]');
  let heroImages = [];
  
  try {
    heroImages = JSON.parse(heroImagesJson);
  } catch (error) {
    // If parsing fails, check for old single image format
    const oldHeroImage = await Settings.getSetting('heroImage', '/Untitled.png');
    if (oldHeroImage && oldHeroImage !== '/Untitled.png') {
      heroImages = [oldHeroImage];
    } else {
      heroImages = ['/Untitled.png'];
    }
  }
  
  // Ensure it's an array
  if (!Array.isArray(heroImages)) {
    heroImages = heroImages.length > 0 ? [heroImages] : ['/Untitled.png'];
  }
  
  // For backward compatibility, also return single heroImage
  res.json({
    success: true,
    heroImages,
    heroImage: heroImages[0] || '/Untitled.png', // Keep for backward compatibility
  });
});

// Upload hero image (single - for backward compatibility)
export const uploadHeroImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  // Get the file path relative to the uploads directory
  const filePath = `/uploads/${req.file.filename}`;

  // Delete old hero image if it exists and is in uploads folder
  const currentHeroImage = await Settings.getSetting('heroImage', '');
  if (currentHeroImage && currentHeroImage.startsWith('/uploads/')) {
    const oldFilePath = path.join(__dirname, '../../', currentHeroImage);
    if (fs.existsSync(oldFilePath)) {
      try {
        fs.unlinkSync(oldFilePath);
      } catch (error) {
        console.error('Error deleting old hero image:', error);
      }
    }
  }

  // Save the new image path
  const setting = await Settings.setSetting('heroImage', filePath, 'Hero section image URL');

  res.json({
    success: true,
    message: 'Hero image uploaded successfully',
    heroImage: filePath,
    setting,
  });
});

// Upload multiple hero images
export const uploadHeroImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded',
    });
  }

  // Get current hero images
  const currentHeroImagesJson = await Settings.getSetting('heroImages', '[]');
  let currentHeroImages = [];
  
  try {
    currentHeroImages = JSON.parse(currentHeroImagesJson);
  } catch (error) {
    // If parsing fails, check for old single image format
    const oldHeroImage = await Settings.getSetting('heroImage', '');
    if (oldHeroImage && oldHeroImage !== '/Untitled.png') {
      currentHeroImages = [oldHeroImage];
    }
  }
  
  if (!Array.isArray(currentHeroImages)) {
    currentHeroImages = [];
  }

  // Get file paths for new uploads
  const newImagePaths = req.files.map(file => `/uploads/${file.filename}`);
  
  // Combine with existing images
  const allImages = [...currentHeroImages, ...newImagePaths];
  
  // Save as JSON array
  const setting = await Settings.setSetting('heroImages', JSON.stringify(allImages), 'Hero section images array');

  res.json({
    success: true,
    message: `${req.files.length} hero image(s) uploaded successfully`,
    heroImages: allImages,
    setting,
  });
});

// Delete a hero image
export const deleteHeroImage = asyncHandler(async (req, res) => {
  const { imagePath } = req.body;
  
  if (!imagePath) {
    return res.status(400).json({
      success: false,
      message: 'Image path is required',
    });
  }

  // Get current hero images
  const currentHeroImagesJson = await Settings.getSetting('heroImages', '[]');
  let currentHeroImages = [];
  
  try {
    currentHeroImages = JSON.parse(currentHeroImagesJson);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Error parsing hero images',
    });
  }
  
  if (!Array.isArray(currentHeroImages)) {
    currentHeroImages = [];
  }

  // Remove the image from array
  const updatedImages = currentHeroImages.filter(img => img !== imagePath);
  
  // Delete the file from filesystem if it's in uploads folder
  if (imagePath.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, '../../', imagePath);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Error deleting hero image file:', error);
      }
    }
  }
  
  // Save updated array
  const setting = await Settings.setSetting('heroImages', JSON.stringify(updatedImages), 'Hero section images array');

  res.json({
    success: true,
    message: 'Hero image deleted successfully',
    heroImages: updatedImages,
    setting,
  });
});

