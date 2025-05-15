import {
      Controller,
      Get,
      Post,
      Body,
      UseGuards,
      Param,
} from '@nestjs/common';
import {
      ApiTags,
      ApiBody,
      ApiResponse,
      ApiBearerAuth,
      ApiProperty,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../user/jwt-auth.guard';
import { CategoryName } from './category.entity';

class CreateCategoryDto {
      @ApiProperty({ enum: CategoryName, enumName: 'CategoryName' })
      name: CategoryName;
}

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoryController {
      constructor(private readonly categoryService: CategoryService) { }

      @UseGuards(JwtAuthGuard)
      @Get()
      @ApiResponse({ status: 200, description: 'Get all categories.' })
      async findAll() {
            return this.categoryService.findAll();
      }

      @UseGuards(JwtAuthGuard)
      @Post(':name')
      @ApiResponse({ status: 201, description: 'Category created.' })
      async create(@Param() param: CreateCategoryDto) {
            return this.categoryService.create(param.name);
      }
}
