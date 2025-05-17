import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { User } from '../user/user.entity';
import { Category } from '../category/category.entity';
import { CreateTaskDto, UpdateTaskDto } from './dto/task-request.dto';
import { ApiDoc } from '../shared/decorators/api-doc.decorators';
import { EmptyResponseDto } from '../shared/dto';
import { Task } from './task.entity';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @ApiDoc({
    summary: 'Get all tasks for the authenticated user',
    operationId: 'findAllTasks',
    okSchema: EmptyResponseDto,
    description: 'Returns all tasks for the current user.',
  })
  @Get()
  async findAll(@Req() req: { user: { userId?: string; id?: string } }) {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new Error('User ID is required to fetch tasks');
    }
    return this.taskService.findAllTasksWithoutUser(userId);
  }

  @ApiDoc({
    summary: 'Create a new task',
    operationId: 'createTask',
    okSchema: EmptyResponseDto,
    description: 'Creates a new task for the user.',
  })
  @Post()
  async create(
    @Body() body: CreateTaskDto,
    @Req() req: { user: { userId?: string; id?: string } },
  ) {
    const userId = String(req.user?.userId || req.user?.id);
    const user = { id: userId } as User;
    const categoryId = { id: body.categoryId } as Category;
    return this.taskService.create(
      body.title,
      body.description ?? '',
      categoryId,
      user,
    );
  }

  @ApiDoc({
    summary: 'Update a task',
    operationId: 'updateTask',
    okSchema: EmptyResponseDto,
    description: 'Updates a task by ID.',
  })
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateTaskDto) {
    const updateData: Partial<Record<keyof UpdateTaskDto, unknown>> = {
      ...body,
    };
    if (body.categoryId) {
      updateData.categoryId = { id: body.categoryId } as Category;
    }
    return this.taskService.update(id, updateData as Partial<Task>);
  }

  @ApiDoc({
    summary: 'Delete a task',
    operationId: 'deleteTask',
    okSchema: EmptyResponseDto,
    description: 'Deletes a task by ID.',
  })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.taskService.delete(id);
    return { deleted: true };
  }

  @ApiDoc({
    summary: 'Mark a task as complete',
    operationId: 'markTaskComplete',
    okSchema: EmptyResponseDto,
    description: 'Marks a task as complete by ID.',
  })
  @Post(':id/complete')
  async markComplete(@Param('id') id: string) {
    return this.taskService.markComplete(id, true);
  }

  @ApiDoc({
    summary: 'Mark a task as incomplete',
    operationId: 'markTaskIncomplete',
    okSchema: EmptyResponseDto,
    description: 'Marks a task as incomplete by ID.',
  })
  @Post(':id/incomplete')
  async markIncomplete(@Param('id') id: string) {
    return this.taskService.markComplete(id, false);
  }
}
