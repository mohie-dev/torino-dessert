import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { CategoriesService } from '../categories/categories.service.js';
import { ProductFilterDto } from './dto/product-filter.dto.js';
import { TagsService } from '../tags/tags.service.js';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productsRepository: Repository<Product>,
        private readonly categoriesService: CategoriesService,
        private readonly tagsService: TagsService,
    ) { }

    async create(createProductDto: CreateProductDto): Promise<Product> {
        const { categoryId, tagIds, images, ...productData } = createProductDto;

        const category = await this.categoriesService.findOne(categoryId);

        const product = this.productsRepository.create({
            ...productData,
            category,
            images,
        });

        if (tagIds && tagIds.length > 0) {
            const tags = await this.tagsService.findByIds(tagIds);

            if (tags.length !== tagIds.length) {
                throw new BadRequestException('بعض الوسوم (Tags) المحددة غير موجودة.');
            }

            product.tags = tags;
        }
        return await this.productsRepository.save(product);
    }

    async findAll(filterDto: ProductFilterDto) {
        const { search, categoryId, isAvailable, isArchived, page = 1, limit = 10 } = filterDto;

        const query = this.productsRepository.createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.images', 'images')
            .leftJoinAndSelect('product.tags', 'tags');

        if (isArchived !== undefined) {
            query.andWhere('product.isArchived = :isArchived', { isArchived });
        }

        if (search) {
            query.andWhere('product.name ILIKE :search', { search: `%${search}%` });
        }

        if (categoryId) {
            query.andWhere('product.categoryId = :categoryId', { categoryId });
        }

        if (isAvailable !== undefined) {
            query.andWhere('product.isAvailable = :isAvailable', { isAvailable });
        }

        const skip = (page - 1) * limit;
        query.skip(skip).take(limit);

        query.orderBy('product.createdAt', 'DESC');
        query.addOrderBy('images.sortOrder', 'ASC');

        const [data, total] = await query.getManyAndCount();

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.productsRepository.findOne({
            where: { id },
            relations: {
                category: true,
                images: true,
                tags: true,
            },
            order: {
                images: {
                    sortOrder: 'ASC',
                },
            },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }

    async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.findOne(id);

        const { categoryId, tagIds, images, ...productData } = updateProductDto;

        if (categoryId) {
            const category = await this.categoriesService.findOne(categoryId);
            product.category = category;
        }

        if (tagIds !== undefined) {
            const tags = tagIds.length > 0 ? await this.tagsService.findByIds(tagIds) : [];
            product.tags = tags;
        }

        if (images !== undefined) {
            product.images = images as any;
        }

        Object.assign(product, productData);

        return await this.productsRepository.save(product);
    }

    async remove(id: string): Promise<void> {
        const product = await this.findOne(id);

        product.isArchived = true;
        product.isAvailable = false;
        await this.productsRepository.save(product);
    }

    async toggleAvailability(id: string): Promise<Product> {
        const product = await this.findOne(id);
        product.isAvailable = !product.isAvailable;
        return await this.productsRepository.save(product);
    }

    async restore(id: string): Promise<Product> {
        const product = await this.findOne(id);
        product.isArchived = false;
        return await this.productsRepository.save(product);
    }
}