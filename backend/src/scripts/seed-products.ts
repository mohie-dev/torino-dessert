import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../config/data-source.js';
import { Category } from '../modules/categories/entities/category.entity.js';
import { Product } from '../modules/products/entities/product.entity.js';

async function seedProducts() {
    console.log('🌱 Starting Categories & Products Seeding...');

    const dataSource = new DataSource(dataSourceOptions);

    try {
        await dataSource.initialize();
        console.log('✅ Database connected.');

        const categoryRepo = dataSource.getRepository(Category);
        const productRepo = dataSource.getRepository(Product);

        const count = await categoryRepo.count();
        if (count > 0) {
            console.log('⚠️ Database already seeded with categories. Skipping...');
            process.exit(0);
        }

        console.log('📦 Creating Categories...');
        const category1 = categoryRepo.create({ name: 'جاتوه', description: 'تشكيلة جاتوه طازج' });
        const category2 = categoryRepo.create({ name: 'تورت', description: 'تورت لجميع المناسبات' });
        const category3 = categoryRepo.create({ name: 'تشيز كيك', description: 'أفضل أنواع التشيز كيك' });

        await categoryRepo.save([category1, category2, category3]);

        console.log('🍰 Creating Products...');
        const products = productRepo.create([
            {
                name: 'جاتوه شيكولاتة',
                description: 'قطعة جاتوه شيكولاتة غنية بالكريمة',
                price: 35.00,
                // 👈 التعديل هنا: تحويل imageUrl إلى مصفوفة صور
                images: [{ url: 'https://res.cloudinary.com/ulbm5bpm/image/upload/v1790806645/torino-dessert/pmhurjwopxbuqt56zs3d.jpg', sortOrder: 0 }],
                category: category1,
                isAvailable: true,
            },
            {
                name: 'تورتة فواكه مقاس 24',
                description: 'تورتة فانيليا مزينة بالفواكه',
                price: 350.00,
                // 👈 التعديل هنا
                images: [{ url: 'https://res.cloudinary.com/ulbm5bpm/image/upload/v1790806794/torino-dessert/nfwxlcysnvubl0vgbjbq.jpg', sortOrder: 0 }],
                category: category2,
                isAvailable: true,
            },
            {
                name: 'تشيز كيك فراولة',
                description: 'شريحة تشيز كيك نيويورك',
                price: 55.00,
                images: [{ url: 'https://res.cloudinary.com/ulbm5bpm/image/upload/v1790806794/torino-dessert/nfwxlcysnvubl0vgbjbq.jpg', sortOrder: 0 }],
                category: category3,
                isAvailable: true,
            },
        ]);

        await productRepo.save(products);
        console.log('🎉 Categories and Products created successfully!');

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
}

seedProducts();