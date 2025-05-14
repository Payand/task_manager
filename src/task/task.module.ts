import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './domain/task.entity';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TaskGateway } from './task.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  providers: [
    TaskService,
    TaskGateway,
  ],
  controllers: [TaskController],
  exports: [TypeOrmModule, TaskGateway],
})
export class TaskModule {}
