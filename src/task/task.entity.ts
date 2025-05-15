import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Category } from '../category/category.entity';
import { User } from '../user/user.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  completed: boolean;

  @ManyToOne(() => Category, (category) => category.tasks)
  category: Category;

  @ManyToOne(() => User, (user) => user.tasks)
  user: User;
}
