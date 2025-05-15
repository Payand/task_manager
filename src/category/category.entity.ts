import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from '../task/task.entity';

export enum CategoryName {
  PERSONAL = 'Personal',
  WORK = 'Work',
  HOBBY = 'Hobby',
  OTHER = 'Other',
}

@Entity()
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: 'enum',
    enum: CategoryName,
    unique: true,
  })
  name: CategoryName;

  @OneToMany(() => Task, (task) => task.category)
  tasks: Task[];
}
