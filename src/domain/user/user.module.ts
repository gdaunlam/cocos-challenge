import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepositoryImpl } from './repository/user.repository.impl';
import { User } from '../../database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    UserRepositoryImpl,
  ],
  exports: [UserRepositoryImpl],
})
export class UserModule {}