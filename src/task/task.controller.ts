import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { JwtAuthGuard } from '../user/jwt-auth.guard';
import { User } from '../user/user.entity';
import { Category } from '../category/category.entity';
import { CreateTaskDto, UpdateTaskDto } from './dto/task-request.dto';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
      constructor(private readonly taskService: TaskService) { }

      @ApiResponse({ status: 200, description: 'Get all tasks for user.' })
      @Get()
      async findAll(@Req() req) {
            const userId = req.user.userId || req.user.id;
            return this.taskService.findAllTasksWithoutUser(userId);
      }

      @ApiBody({ type: CreateTaskDto })
      @ApiResponse({ status: 201, description: 'Task created.' })
      @Post()
      async create(@Body() body: CreateTaskDto, @Req() req) {
            const userId = req.user.userId || req.user.id;
            const user = { id: userId } as User;
            const category = { id: body.category } as Category;
            return this.taskService.create(body.title, body.description ?? '', category, user);
      }

      @ApiParam({ name: 'id', type: 'string' })
      @ApiBody({ type: UpdateTaskDto })
      @ApiResponse({ status: 200, description: 'Task updated.' })
      @Put(':id')
      async update(@Param('id') id: string, @Body() body: UpdateTaskDto) {
            const updateData: any = { ...body };
            if (body.category) {
                  updateData.category = { id: body.category } as Category;
            }
            return this.taskService.update(id, updateData);
      }

      @ApiParam({ name: 'id', type: 'string' })
      @ApiResponse({ status: 200, description: 'Task deleted.' })
      @Delete(':id')
      async delete(@Param('id') id: string) {
            await this.taskService.delete(id);
            return { deleted: true };
      }

      @ApiParam({ name: 'id', type: 'string' })
      @ApiResponse({ status: 201, description: 'Task marked as complete.' })
      @Post(':id/complete')
      async markComplete(@Param('id') id: string) {
            return this.taskService.markComplete(id, true);
      }

      @ApiParam({ name: 'id', type: 'string' })
      @ApiResponse({ status: 201, description: 'Task marked as incomplete.' })
      @Post(':id/incomplete')
      async markIncomplete(@Param('id') id: string) {
            return this.taskService.markComplete(id, false);
      }
}
