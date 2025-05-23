import { DataSource } from 'typeorm';
import { Task } from '../../task/task.entity';
import { Category } from '../../category/category.entity';
import { User } from '../../user/user.entity';
import * as dotenv from 'dotenv';
dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'task_manager',
  entities: [Task, Category, User],
  synchronize: true,
});
