import { forwardRef, Inject, Injectable } from '@nestjs/common';
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
      ) { }

      async create(title: string, description: string, category: Category, user: User): Promise<Task> {
            const task = this.taskRepository.create({ title, description, category, user });
            const saved = await this.taskRepository.save(task);
            this.taskGateway.notifyTaskCreated(saved);
            return saved;
      }

      async findAll(userOrUserId: User | string): Promise<Task[]> {
            return this.taskRepository.find({
                  where: typeof userOrUserId === 'string'
                        ? { user: { id: userOrUserId } }
                        : { user: userOrUserId },
                  relations: ['category', 'user'],
            });
      }

      async update(id: string, data: Partial<Task>): Promise<Task | null> {
            await this.taskRepository.update(id, data);
            const updated = await this.taskRepository.findOne({ where: { id } });
            if (updated) this.taskGateway.notifyTaskUpdated(updated);
            return updated;
      }

      async delete(id: string): Promise<void> {
            await this.taskRepository.delete(id);
            this.taskGateway.notifyTaskDeleted(id);
      }

      async markComplete(id: string, completed: boolean): Promise<Task | null> {
            await this.taskRepository.update(id, { completed });
            const updated = await this.taskRepository.findOne({ where: { id } });
            if (updated) this.taskGateway.notifyTaskCompleted(updated);
            return updated;
      }

      async findAllTasksWithoutUser(userOrUserId: User | string): Promise<Omit<Task, 'user'>[]> {
            const qb = this.taskRepository.createQueryBuilder('task')
                  .leftJoinAndSelect('task.category', 'category');
            if (typeof userOrUserId === 'string') {
                  qb.where('task.userId = :userId', { userId: userOrUserId });
            } else {
                  qb.where('task.userId = :userId', { userId: userOrUserId.id });
            }
            const tasks = await qb.getMany();
            return tasks.map(({ user, ...rest }) => rest);
      }
}
