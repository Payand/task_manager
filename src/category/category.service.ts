import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, CategoryName } from './category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    try {
      return await this.categoryRepository.find();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }

  async create(name: CategoryName): Promise<Category> {
    try {
      const exists = await this.categoryRepository.findOne({ where: { name } });
      if (exists) {
        throw new ConflictException('Category with this name already exists');
      }
      const category = this.categoryRepository.create({ name });
      return await this.categoryRepository.save(category);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Failed to create category');
    }
  }
}
