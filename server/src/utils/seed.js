import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/database.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

dotenv.config();

const categories = [
  {
    name: 'Electronics',
    description: 'Latest electronic gadgets and devices',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500',
  },
  {
    name: 'Fashion',
    description: 'Trendy clothing and accessories',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500',
  },
  {
    name: 'Home & Living',
    description: 'Beautiful home decor and furniture',
    image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500',
  },
  {
    name: 'Sports & Outdoors',
    description: 'Gear for your active lifestyle',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500',
  },
  {
    name: 'Books',
    description: 'Discover your next great read',
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500',
  },
];

const products = [
  // Electronics
  {
    name: 'Wireless Headphones Pro',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life. Experience crystal-clear audio with deep bass and comfortable ear cushions for all-day wear.',
    price: 299.99,
    stock: 50,
    sku: 'ELEC-WH-001',
    rating: 4.8,
    numReviews: 234,
    tags: ['audio', 'wireless', 'premium'],
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500',
    ],
  },
  {
    name: 'Smart Watch Ultra',
    description: 'Advanced fitness tracking smartwatch with GPS, heart rate monitor, and sleep tracking. Water-resistant and compatible with iOS and Android.',
    price: 399.99,
    stock: 30,
    sku: 'ELEC-SW-002',
    rating: 4.6,
    numReviews: 189,
    tags: ['wearable', 'fitness', 'smart'],
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500',
    ],
  },
  {
    name: '4K Webcam Pro',
    description: 'Professional 4K webcam with autofocus and built-in microphone. Perfect for streaming, video calls, and content creation.',
    price: 149.99,
    stock: 45,
    sku: 'ELEC-WC-003',
    rating: 4.5,
    numReviews: 145,
    tags: ['camera', 'streaming', '4k'],
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500',
    ],
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: '360-degree sound portable speaker with 20-hour battery. Waterproof and perfect for outdoor adventures.',
    price: 89.99,
    stock: 60,
    sku: 'ELEC-SP-004',
    rating: 4.7,
    numReviews: 312,
    tags: ['audio', 'portable', 'bluetooth'],
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
    ],
  },

  // Fashion
  {
    name: 'Classic Leather Jacket',
    description: 'Genuine leather jacket with premium stitching and timeless design. Available in multiple sizes.',
    price: 249.99,
    stock: 25,
    sku: 'FASH-LJ-001',
    rating: 4.9,
    numReviews: 98,
    tags: ['leather', 'jacket', 'classic'],
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
    ],
  },
  {
    name: 'Designer Sunglasses',
    description: 'UV400 protection designer sunglasses with polarized lenses. Lightweight and stylish frame.',
    price: 129.99,
    stock: 40,
    sku: 'FASH-SG-002',
    rating: 4.4,
    numReviews: 167,
    tags: ['sunglasses', 'accessories', 'designer'],
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
    ],
  },
  {
    name: 'Premium Canvas Backpack',
    description: 'Durable canvas backpack with laptop compartment and multiple pockets. Perfect for daily commute or travel.',
    price: 79.99,
    stock: 55,
    sku: 'FASH-BP-003',
    rating: 4.6,
    numReviews: 203,
    tags: ['backpack', 'travel', 'canvas'],
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
    ],
  },

  // Home & Living
  {
    name: 'Modern Table Lamp',
    description: 'Minimalist LED table lamp with adjustable brightness and color temperature. Energy-efficient and stylish.',
    price: 69.99,
    stock: 35,
    sku: 'HOME-TL-001',
    rating: 4.7,
    numReviews: 156,
    tags: ['lighting', 'led', 'modern'],
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
    ],
  },
  {
    name: 'Cozy Throw Blanket',
    description: 'Ultra-soft fleece throw blanket. Perfect for couch cuddles and adding warmth to any room.',
    price: 39.99,
    stock: 70,
    sku: 'HOME-BL-002',
    rating: 4.8,
    numReviews: 289,
    tags: ['blanket', 'cozy', 'home'],
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=500',
    ],
  },
  {
    name: 'Ceramic Vase Set',
    description: 'Set of 3 handcrafted ceramic vases in different sizes. Modern design perfect for any home decor.',
    price: 54.99,
    stock: 42,
    sku: 'HOME-VS-003',
    rating: 4.5,
    numReviews: 78,
    tags: ['vase', 'ceramic', 'decor'],
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=500',
    ],
  },

  // Sports & Outdoors
  {
    name: 'Yoga Mat Premium',
    description: 'Extra-thick non-slip yoga mat with carrying strap. Eco-friendly material, perfect for all types of yoga and exercise.',
    price: 49.99,
    stock: 65,
    sku: 'SPRT-YM-001',
    rating: 4.7,
    numReviews: 412,
    tags: ['yoga', 'fitness', 'mat'],
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
    ],
  },
  {
    name: 'Camping Tent 4-Person',
    description: 'Waterproof 4-person camping tent with easy setup. Includes rainfly and storage pockets.',
    price: 179.99,
    stock: 20,
    sku: 'SPRT-CT-002',
    rating: 4.6,
    numReviews: 134,
    tags: ['camping', 'outdoor', 'tent'],
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=500',
    ],
  },

  // Books
  {
    name: 'The Art of Programming',
    description: 'Comprehensive guide to modern programming practices. Perfect for beginners and intermediate developers.',
    price: 34.99,
    stock: 80,
    sku: 'BOOK-PR-001',
    rating: 4.9,
    numReviews: 567,
    tags: ['programming', 'tech', 'education'],
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500',
    ],
  },
  {
    name: 'Mindfulness & Meditation',
    description: 'Discover inner peace through proven mindfulness techniques. Includes guided meditation exercises.',
    price: 24.99,
    stock: 95,
    sku: 'BOOK-MD-002',
    rating: 4.8,
    numReviews: 423,
    tags: ['mindfulness', 'self-help', 'meditation'],
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500',
    ],
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing database...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    console.log('👤 Creating admin user...');
    const admin = await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@ecommerce.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin',
      phone: '+1234567890',
      address: {
        street: '123 Admin Street',
        city: 'Admin City',
        postalCode: '12345',
        country: 'USA',
      },
    });

    console.log('👤 Creating demo user...');
    const demoUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'user',
      phone: '+1987654321',
      address: {
        street: '456 User Avenue',
        city: 'Demo City',
        postalCode: '54321',
        country: 'USA',
      },
    });

    console.log('📂 Creating categories...');
    const createdCategories = await Category.insertMany(categories);

    console.log('📦 Creating products...');
    const productsWithCategories = products.map((product, index) => ({
      ...product,
      category: createdCategories[Math.floor(index / 3)]._id,
    }));
    const createdProducts = await Product.insertMany(productsWithCategories);

    console.log('🛒 Creating sample order...');
    await Order.create({
      user: demoUser._id,
      items: [
        {
          product: createdProducts[0]._id,
          name: createdProducts[0].name,
          quantity: 2,
          price: createdProducts[0].price,
          image: createdProducts[0].images[0],
        },
        {
          product: createdProducts[4]._id,
          name: createdProducts[4].name,
          quantity: 1,
          price: createdProducts[4].price,
          image: createdProducts[4].images[0],
        },
      ],
      subtotal: 849.97,
      shippingCost: 0,
      total: 849.97,
      status: 'Pending',
    });

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Seed Summary:');
    console.log(`   Admin Email: ${admin.email}`);
    console.log(`   Admin Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log(`   Demo User Email: ${demoUser.email}`);
    console.log(`   Demo User Password: password123`);
    console.log(`   Categories: ${createdCategories.length}`);
    console.log(`   Products: ${createdProducts.length}`);
    console.log(`   Orders: 1`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
