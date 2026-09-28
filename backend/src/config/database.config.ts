import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
    type: 'postgres',
    url: process.env.DATABASE_URI,
    synchronize: false,
    autoLoadEntities: true,
    ssl: {
        rejectUnauthorized: false,
    },
}));