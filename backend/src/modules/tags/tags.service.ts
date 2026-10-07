import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity.js';
import { CreateTagDto } from './dto/create-tag.dto.js';

@Injectable()
export class TagsService {
    constructor(
        @InjectRepository(Tag)
        private readonly tagsRepository: Repository<Tag>,
    ) { }

    async create(createTagDto: CreateTagDto): Promise<Tag> {
        const tag = this.tagsRepository.create(createTagDto);
        return await this.tagsRepository.save(tag);
    }

    async findAll(): Promise<Tag[]> {
        return await this.tagsRepository.find();
    }

    async findOne(id: string): Promise<Tag> {
        const tag = await this.tagsRepository.findOne({ where: { id } });
        if (!tag) {
            throw new NotFoundException(`Tag with ID ${id} not found`);
        }
        return tag;
    }

    async findByIds(ids: string[]): Promise<Tag[]> {
        return await this.tagsRepository.createQueryBuilder('tag')
            .where('tag.id IN (:...ids)', { ids })
            .getMany();
    }

    async remove(id: string): Promise<void> {
        const tag = await this.findOne(id);
        await this.tagsRepository.remove(tag);
    }
}