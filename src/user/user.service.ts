import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | undefined> {
    try {
      const user = await this.userRepository.findOne({ where: { username } });
      return user === null ? undefined : user;
    } catch {
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async create(username: string, password: string): Promise<User> {
    try {
      const existing = await this.userRepository.findOne({
        where: { username },
      });
      if (existing) {
        throw new ConflictException('Username already exists');
      }
      const hashed = await bcrypt.hash(password, 10);
      const user = this.userRepository.create({ username, password: hashed });
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    try {
      const user = await this.findByUsername(username);
      if (user && (await bcrypt.compare(password, user.password))) {
        return user;
      }
      return null;
    } catch {
      throw new InternalServerErrorException('Failed to validate user');
    }
  }
}
