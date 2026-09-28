import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URI,
  entities: ['src/modules/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],   
  synchronize: false,
  ssl: {
    rejectUnauthorized: false,
  },
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;