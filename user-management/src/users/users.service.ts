import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from './entities/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({ 
      where: [
        { username: createUserDto.username }, 
        { email: createUserDto.email }
      ] 
    });
    
    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user = this.usersRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      password: hashedPassword,
      roles: createUserDto.roles ? createUserDto.roles as Role[] : [Role.User]
    });

    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['vehicles'] });
  }

  async findById(id: number): Promise<User> {
    return this.usersRepository.findOne({ where: { id }, relations: ['vehicles'] });
  }

  async findByUsername(username: string): Promise<User> {
    return this.usersRepository.findOne({ where: { username }, relations: ['vehicles'] });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updates: Partial<User> = { ...updateUserDto };

    if (updateUserDto.password) {
      updates.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updates);
    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}

// changelog