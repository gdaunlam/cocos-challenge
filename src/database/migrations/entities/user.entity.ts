import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1 })
  id!: number;

  @Column()
  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @Column({ unique: true })
  @ApiProperty({ example: 'ACC-123456' })
  accountNumber!: string;
}
