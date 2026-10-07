import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service.js';
import { ProductsController } from './products.controller.js';
import { Product } from './entities/product.entity.js';
import { CategoriesModule } from '../categories/categories.module.js';
import { TagsModule } from '../tags/tags.module.js';
import { ProductImage } from './entities/product-image.entity.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([Product, ProductImage]),
        CategoriesModule,
        TagsModule
    ],
    controllers: [ProductsController],
    providers: [ProductsService],
    exports: [ProductsService]
})
export class ProductsModule { }