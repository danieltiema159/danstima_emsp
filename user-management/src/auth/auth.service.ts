import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../users/entities/role.enum';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    console.log('AuthService validateUser - Looking up user:', email);
    
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'username', 'roles'] // Make sure we select the password
    });
    
    console.log('AuthService validateUser - User found:', !!user);
    
    if (user) {
      console.log('AuthService validateUser - Comparing passwords');
      const isMatch = await bcrypt.compare(pass, user.password);
      console.log('AuthService validateUser - Password match:', isMatch);
      
      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
    }
    
    return null;
  }

  async login(user: any) {
    console.log('AuthService login - Creating JWT payload for user:', user.email);
    const payload = { 
      email: user.email, 
      sub: user.id,
      username: user.username,
      roles: user.roles 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    console.log('AuthService register - Starting registration for:', registerDto.email);
    
    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: registerDto.email },
        { username: registerDto.username }
      ]
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    console.log('AuthService register - Password hashed');

    // Create new user
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      roles: (registerDto.roles as Role[]) || [Role.User]
    });

    const savedUser = await this.userRepository.save(user);
    console.log('AuthService register - User saved successfully');

    // Remove password from response
    const { password, ...result } = savedUser;
    return result;
  }

  async findUserByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }
}