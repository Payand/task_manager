import { Controller, Get, Post, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { ApiDoc } from '../shared/decorators/api-doc.decorators';
import { EmptyResponseDto } from '../shared/dto';
import { CreatCategoryRequestDto } from './dto/createCategoryRequest.dto';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(JwtAuthGuard)
  @ApiDoc({
    summary: 'Get all categories',
    operationId: 'findAllCategories',
    okSchema: EmptyResponseDto,
    description: 'Returns all available categories.',
  })
  @Get()
  async findAll() {
    return this.categoryService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiDoc({
    summary: 'Create a category',
    operationId: 'createCategory',
    okSchema: EmptyResponseDto,
    description: 'Creates a new category by name.',
  })
  @Post(':name')
  async create(@Param() param: CreatCategoryRequestDto) {
    return this.categoryService.create(param.name);
  }
}
