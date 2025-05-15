import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { Category } from '../category/category.entity';
import { User } from '../user/user.entity';
import { TaskGateway } from './task.gateway';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @Inject(forwardRef(() => TaskGateway))
    private readonly taskGateway: TaskGateway,
  ) {}

  async create(
    title: string,
    description: string,
    category: Category,
    user: User,
  ): Promise<Omit<Task, 'user'>> {
    try {
      const existing = await this.taskRepository.findOne({
        where: { title, user: { id: user.id } },
      });
      if (existing) {
        throw new ConflictException(
          'A task with this title already exists for this user',
        );
      }
      const task = this.taskRepository.create({
        title,
        description,
        category,
        user,
      });
      const saved = await this.taskRepository.save(task);
      this.taskGateway.notifyTaskCreated(saved);


      const { user: any, ...rest } = saved;
      return rest;
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Failed to create task');
    }
  }

  async findAll(userOrUserId: User | string): Promise<Task[]> {
    try {
      return await this.taskRepository.find({
        where:
          typeof userOrUserId === 'string'
            ? { user: { id: userOrUserId } }
            : { user: userOrUserId },
        relations: ['category', 'user'],
      });
    } catch {
      throw new InternalServerErrorException('Failed to fetch tasks');
    }
  }

  async update(id: string, data: Partial<Task>): Promise<Task | null> {
    try {
      await this.taskRepository.update(id, data);
      const updated = await this.taskRepository.findOne({ where: { id } });
      if (!updated) throw new NotFoundException('Task not found');
      this.taskGateway.notifyTaskUpdated(updated);
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update task');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.taskRepository.delete(id);
      if (result.affected === 0) throw new NotFoundException('Task not found');
      this.taskGateway.notifyTaskDeleted(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete task');
    }
  }

  async markComplete(id: string, completed: boolean): Promise<Task | null> {
    try {
      await this.taskRepository.update(id, { completed });
      const updated = await this.taskRepository.findOne({ where: { id } });
      if (!updated) throw new NotFoundException('Task not found');
      this.taskGateway.notifyTaskCompleted(updated);
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Failed to update task completion status',
      );
    }
  }

  async findAllTasksWithoutUser(
    userOrUserId: User | string,
  ): Promise<Omit<Task, 'user'>[]> {
    try {
      const qb = this.taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.category', 'category');
      if (typeof userOrUserId === 'string') {
        qb.where('task.userId = :userId', { userId: userOrUserId });
      } else {
        qb.where('task.userId = :userId', { userId: userOrUserId.id });
      }
      const tasks = await qb.getMany();
      return tasks.map((task) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { user, ...rest } = task;
        return rest;
      });
    } catch {
      throw new InternalServerErrorException('Failed to fetch tasks');
    }
  }
}
