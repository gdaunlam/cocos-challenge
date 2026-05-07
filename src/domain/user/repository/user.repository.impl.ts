import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../database/entities/user.entity';

@Injectable()
export class UserRepositoryImpl {
  constructor(@InjectRepository(User) private readonly repository: Repository<User>) {}

  async getById(id: number): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }
}