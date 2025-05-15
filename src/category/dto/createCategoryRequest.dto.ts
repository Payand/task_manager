import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CategoryName } from '../category.entity';

export class CreatCategoryRequestDto {
      @ApiProperty({ enum: CategoryName, enumName: 'CategoryName', description: 'Category name (enum)' })
      @IsEnum(CategoryName, { message: 'name must be a valid enum value of CategoryName' })
      name: CategoryName;
}

