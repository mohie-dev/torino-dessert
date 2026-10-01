import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { User } from '../modules/users/entities/user.entity.js';
import { Permission, UserRole } from '../utils/enums.js';
import { dataSourceOptions } from '../config/data-source.js';
import { Role } from '../modules/roles/entities/role.entity.js';

dotenv.config();

async function seedAdmin() {
    const adminEmail = process.env.SEED_ADMIN_EMAIL;
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        console.error('❌ SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD is missing in .env');
        process.exit(1);
    }

    console.log('🌱 Starting Admin Seeding...');

    const dataSource = new DataSource(dataSourceOptions);

    try {
        await dataSource.initialize();
        console.log('✅ Database connected.');

        const userRepository = dataSource.getRepository(User);

        const roleRepository = dataSource.getRepository(Role);

        const existingAdmin = await userRepository.findOne({ where: { email: adminEmail } });
        if (existingAdmin) {
            console.log('⚠️ Admin user already exists. Seeding skipped.');
            process.exit(0);
        }

        console.log('🔐 Hashing password...');
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

        let adminRole = await roleRepository.findOne({ where: { name: 'Super Admin' } });

        if (!adminRole) {
            console.log('🛡️ Creating Super Admin role...');
            adminRole = roleRepository.create({
                name: 'Super Admin',
                permissions: Object.values(Permission),
            });
            await roleRepository.save(adminRole);
        }

        const adminUser = userRepository.create({
            firstName: 'System',
            lastName: 'Administrator',
            email: adminEmail,
            passwordHash: passwordHash,
            role: adminRole,
            isActive: true,
        });

        await userRepository.save(adminUser);
        console.log('🎉 Admin user created successfully!');

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
}

seedAdmin();