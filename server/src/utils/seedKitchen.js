import dotenv from 'dotenv';
import { connectDB } from '../config/database.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Pack from '../models/Pack.js';
import mongoose from 'mongoose';

dotenv.config();

// Kitchen product images (using placeholder URLs - replace with actual images)
const productImages = {
  cookware: [
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
    'https://images.unsplash.com/photo-1584990347492-1c88b4e3e9c5?w=800',
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800',
  ],
  utensils: [
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
    'https://images.unsplash.com/photo-1584990347492-1c88b4e3e9c5?w=800',
  ],
  appliances: [
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
    'https://images.unsplash.com/photo-1584990347492-1c88b4e3e9c5?w=800',
  ],
  storage: [
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
    'https://images.unsplash.com/photo-1584990347492-1c88b4e3e9c5?w=800',
  ],
  bakeware: [
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
    'https://images.unsplash.com/photo-1584990347492-1c88b4e3e9c5?w=800',
  ],
};

const categoryImages = {
  cookware: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600',
  utensils: 'https://images.unsplash.com/photo-1584990347492-1c88b4e3e9c5?w=600',
  appliances: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600',
  storage: 'https://images.unsplash.com/photo-1584990347492-1c88b4e3e9c5?w=600',
  bakeware: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600',
};

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to database');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Pack.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create Categories and Subcategories
    console.log('📁 Creating categories...');
    
    const cookwareCategory = await Category.create({
      name: 'Ustensiles de Cuisine',
      slug: 'ustensiles-de-cuisine',
      description: 'Tous les ustensiles essentiels pour votre cuisine',
      image: categoryImages.cookware,
      isSubCategory: false,
    });

    const utensilsCategory = await Category.create({
      name: 'Couverts et Accessoires',
      slug: 'couverts-et-accessoires',
      description: 'Couverts, spatules et accessoires de cuisine',
      image: categoryImages.utensils,
      isSubCategory: false,
    });

    const appliancesCategory = await Category.create({
      name: 'Électroménager',
      slug: 'electromenager',
      description: 'Appareils électroménagers pour la cuisine',
      image: categoryImages.appliances,
      isSubCategory: false,
    });

    const storageCategory = await Category.create({
      name: 'Rangement',
      slug: 'rangement',
      description: 'Solutions de rangement pour votre cuisine',
      image: categoryImages.storage,
      isSubCategory: false,
    });

    const bakewareCategory = await Category.create({
      name: 'Pâtisserie',
      slug: 'patisserie',
      description: 'Matériel de pâtisserie et de boulangerie',
      image: categoryImages.bakeware,
      isSubCategory: false,
    });

    // Create Subcategories
    const subcategories = {
      pots: await Category.create({
        name: 'Casseroles et Poêles',
        slug: 'casseroles-et-poeles',
        description: 'Casseroles, poêles et faitouts',
        image: categoryImages.cookware,
        parent: cookwareCategory._id,
        isSubCategory: true,
      }),
      knives: await Category.create({
        name: 'Couteaux',
        slug: 'couteaux',
        description: 'Couteaux de cuisine professionnels',
        image: categoryImages.utensils,
        parent: utensilsCategory._id,
        isSubCategory: true,
      }),
      blenders: await Category.create({
        name: 'Mixeurs et Blenders',
        slug: 'mixeurs-et-blenders',
        description: 'Mixeurs, blenders et robots de cuisine',
        image: categoryImages.appliances,
        parent: appliancesCategory._id,
        isSubCategory: true,
      }),
      containers: await Category.create({
        name: 'Boîtes de Conservation',
        slug: 'boites-de-conservation',
        description: 'Boîtes hermétiques pour la conservation',
        image: categoryImages.storage,
        parent: storageCategory._id,
        isSubCategory: true,
      }),
      molds: await Category.create({
        name: 'Moules à Pâtisserie',
        slug: 'moules-a-patisserie',
        description: 'Moules pour gâteaux et pâtisseries',
        image: categoryImages.bakeware,
        parent: bakewareCategory._id,
        isSubCategory: true,
      }),
    };

    console.log('✅ Categories created');

    // Create Products
    console.log('🛍️  Creating products...');

    const products = [
      // Cookware - Pots and Pans
      {
        name: { fr: 'Casserole Anti-adhésive Premium', ar: 'وعاء طبخ غير لاصق ممتاز' },
        description: {
          fr: 'Casserole anti-adhésive de haute qualité avec revêtement en céramique. Parfaite pour une cuisson saine et facile.',
          ar: 'وعاء طبخ غير لاصق عالي الجودة مع طلاء سيراميك. مثالي للطبخ الصحي والسهل.'
        },
        price: 89.99,
        promoPrice: 69.99,
        category: subcategories.pots._id,
        images: productImages.cookware,
        stock: 50,
        sku: 'COOK-001',
        tags: ['casserole', 'anti-adhésif', 'céramique'],
        featured: true,
        rating: 4.5,
        numReviews: 23,
      },
      {
        name: { fr: 'Poêle à Frire Professionnelle', ar: 'مقلاة احترافية' },
        description: {
          fr: 'Poêle à frire professionnelle en acier inoxydable avec poignée ergonomique. Idéale pour tous types de cuisson.',
          ar: 'مقلاة احترافية من الفولاذ المقاوم للصدأ مع مقبض مريح. مثالية لجميع أنواع الطبخ.'
        },
        price: 129.99,
        promoPrice: 99.99,
        category: subcategories.pots._id,
        images: productImages.cookware,
        stock: 35,
        sku: 'COOK-002',
        tags: ['poêle', 'professionnel', 'inox'],
        featured: true,
        rating: 4.8,
        numReviews: 45,
      },
      {
        name: { fr: 'Faitout en Fonte 5L', ar: 'وعاء حديدي 5 لتر' },
        description: {
          fr: 'Faitout en fonte de 5 litres, excellent pour les ragoûts et les plats mijotés. Conservation de la chaleur optimale.',
          ar: 'وعاء حديدي بسعة 5 لترات، ممتاز لليخنات والأطباق المطبوخة ببطء. يحافظ على الحرارة بشكل مثالي.'
        },
        price: 159.99,
        category: subcategories.pots._id,
        images: productImages.cookware,
        stock: 20,
        sku: 'COOK-003',
        tags: ['faitout', 'fonte', '5L'],
        featured: false,
        rating: 4.6,
        numReviews: 18,
      },
      // Utensils - Knives
      {
        name: { fr: 'Set de Couteaux de Cuisine 6 Pièces', ar: 'مجموعة سكاكين مطبخ 6 قطع' },
        description: {
          fr: 'Set complet de 6 couteaux de cuisine professionnels en acier inoxydable avec étui de rangement.',
          ar: 'مجموعة كاملة من 6 سكاكين مطبخ احترافية من الفولاذ المقاوم للصدأ مع حافظة تخزين.'
        },
        price: 199.99,
        promoPrice: 149.99,
        category: subcategories.knives._id,
        images: productImages.utensils,
        stock: 40,
        sku: 'KNIFE-001',
        tags: ['couteaux', 'set', 'professionnel'],
        featured: true,
        rating: 4.9,
        numReviews: 67,
      },
      {
        name: { fr: 'Couteau Chef 20cm', ar: 'سكين شيف 20 سم' },
        description: {
          fr: 'Couteau de chef professionnel de 20cm avec lame en acier inoxydable et manche ergonomique.',
          ar: 'سكين شيف احترافي 20 سم مع نصل من الفولاذ المقاوم للصدأ ومقبض مريح.'
        },
        price: 79.99,
        category: subcategories.knives._id,
        images: productImages.utensils,
        stock: 60,
        sku: 'KNIFE-002',
        tags: ['couteau', 'chef', '20cm'],
        featured: false,
        rating: 4.7,
        numReviews: 34,
      },
      // Appliances - Blenders
      {
        name: { fr: 'Blender Professionnel 1500W', ar: 'خلاط احترافي 1500 واط' },
        description: {
          fr: 'Blender professionnel haute puissance 1500W avec 6 vitesses et fonction pulse. Parfait pour smoothies et soupes.',
          ar: 'خلاط احترافي عالي القوة 1500 واط مع 6 سرعات ووظيفة النبض. مثالي للعصائر والشوربات.'
        },
        price: 299.99,
        promoPrice: 249.99,
        category: subcategories.blenders._id,
        images: productImages.appliances,
        stock: 25,
        sku: 'BLEND-001',
        tags: ['blender', 'professionnel', '1500W'],
        featured: true,
        rating: 4.8,
        numReviews: 89,
      },
      {
        name: { fr: 'Robot de Cuisine Multifonction', ar: 'روبوت مطبخ متعدد الوظائف' },
        description: {
          fr: 'Robot de cuisine multifonction avec mixeur, hachoir et batteur. 10 accessoires inclus.',
          ar: 'روبوت مطبخ متعدد الوظائف مع خلاط ومفرمة وخفاق. يتضمن 10 ملحقات.'
        },
        price: 449.99,
        promoPrice: 379.99,
        category: subcategories.blenders._id,
        images: productImages.appliances,
        stock: 15,
        sku: 'ROBOT-001',
        tags: ['robot', 'multifonction', '10-accessoires'],
        featured: true,
        rating: 4.9,
        numReviews: 112,
      },
      // Storage - Containers
      {
        name: { fr: 'Set de Boîtes Hermétiques 10 Pièces', ar: 'مجموعة علب محكمة الإغلاق 10 قطع' },
        description: {
          fr: 'Set de 10 boîtes de conservation hermétiques en plastique alimentaire. Tailles variées.',
          ar: 'مجموعة من 10 علب حفظ محكمة الإغلاق من البلاستيك الغذائي. أحجام متنوعة.'
        },
        price: 49.99,
        promoPrice: 39.99,
        category: subcategories.containers._id,
        images: productImages.storage,
        stock: 80,
        sku: 'STOR-001',
        tags: ['boîtes', 'hermétique', '10-pièces'],
        featured: true,
        rating: 4.6,
        numReviews: 156,
      },
      {
        name: { fr: 'Boîtes en Verre avec Couvercle', ar: 'علب زجاجية مع غطاء' },
        description: {
          fr: 'Set de 6 boîtes de conservation en verre borosilicate avec couvercles hermétiques. Micro-ondable.',
          ar: 'مجموعة من 6 علب حفظ من زجاج البوروسيليكات مع أغطية محكمة. صالحة للميكروويف.'
        },
        price: 79.99,
        category: subcategories.containers._id,
        images: productImages.storage,
        stock: 45,
        sku: 'STOR-002',
        tags: ['verre', 'hermétique', 'micro-ondable'],
        featured: false,
        rating: 4.7,
        numReviews: 78,
      },
      // Bakeware - Molds
      {
        name: { fr: 'Moule à Gâteau Rond 24cm', ar: 'قالب كعك دائري 24 سم' },
        description: {
          fr: 'Moule à gâteau rond anti-adhésif de 24cm. Parfait pour gâteaux et tartes.',
          ar: 'قالب كعك دائري غير لاصق 24 سم. مثالي للكعك والفطائر.'
        },
        price: 24.99,
        category: subcategories.molds._id,
        images: productImages.bakeware,
        stock: 100,
        sku: 'MOLD-001',
        tags: ['moule', 'rond', '24cm'],
        featured: false,
        rating: 4.5,
        numReviews: 45,
      },
      {
        name: { fr: 'Set de Moules à Muffins 12 Cavités', ar: 'مجموعة قوالب الكعك 12 تجويف' },
        description: {
          fr: 'Set de 2 moules à muffins anti-adhésifs avec 12 cavités chacun. Idéal pour muffins et cupcakes.',
          ar: 'مجموعة من قالبين للكعك غير لاصقين مع 12 تجويف لكل منهما. مثالي للكعك الصغير والكب كيك.'
        },
        price: 34.99,
        promoPrice: 29.99,
        category: subcategories.molds._id,
        images: productImages.bakeware,
        stock: 70,
        sku: 'MOLD-002',
        tags: ['muffins', '12-cavités', 'set'],
        featured: true,
        rating: 4.8,
        numReviews: 92,
      },
      {
        name: { fr: 'Moule à Pain Rectangulaire', ar: 'قالب خبز مستطيل' },
        description: {
          fr: 'Moule à pain rectangulaire anti-adhésif. Parfait pour pains maison et cakes salés.',
          ar: 'قالب خبز مستطيل غير لاصق. مثالي للخبز المنزلي والكيك المالح.'
        },
        price: 29.99,
        category: subcategories.molds._id,
        images: productImages.bakeware,
        stock: 55,
        sku: 'MOLD-003',
        tags: ['pain', 'rectangulaire', 'anti-adhésif'],
        featured: false,
        rating: 4.4,
        numReviews: 23,
      },
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Create Packs
    console.log('📦 Creating packs...');

    const packs = [
      {
        name: 'Pack Cuisine Complète',
        description: 'Tout ce dont vous avez besoin pour équiper votre cuisine',
        products: [
          { product: createdProducts[0]._id, quantity: 1 },
          { product: createdProducts[3]._id, quantity: 1 },
          { product: createdProducts[6]._id, quantity: 1 },
        ],
        originalPrice: 589.97,
        discountPrice: 469.99,
        discountPercentage: 20,
        image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
        active: true,
        featured: true,
        startDate: new Date(),
      },
      {
        name: 'Pack Pâtisserie Débutant',
        description: 'Tout le nécessaire pour commencer la pâtisserie',
        products: [
          { product: createdProducts[9]._id, quantity: 1 },
          { product: createdProducts[10]._id, quantity: 1 },
          { product: createdProducts[11]._id, quantity: 1 },
        ],
        originalPrice: 89.97,
        discountPrice: 69.99,
        discountPercentage: 22,
        image: 'https://images.unsplash.com/photo-1584990347492-1c88b4e3e9c5?w=800',
        active: true,
        featured: false,
        startDate: new Date(),
      },
      {
        name: 'Pack Conservation Alimentaire',
        description: 'Solutions complètes pour la conservation des aliments',
        products: [
          { product: createdProducts[7]._id, quantity: 1 },
          { product: createdProducts[8]._id, quantity: 1 },
        ],
        originalPrice: 129.98,
        discountPrice: 99.99,
        discountPercentage: 23,
        image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
        active: true,
        featured: true,
        startDate: new Date(),
      },
    ];

    const createdPacks = await Pack.insertMany(packs);
    console.log(`✅ Created ${createdPacks.length} packs`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Categories: ${await Category.countDocuments()}`);
    console.log(`   - Products: ${await Product.countDocuments()}`);
    console.log(`   - Packs: ${await Pack.countDocuments()}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

