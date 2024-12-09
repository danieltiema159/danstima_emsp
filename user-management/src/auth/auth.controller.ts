import { Controller, Request, Post, UseGuards, Body, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req, @Body() loginDto: LoginDto) {
    console.log('AuthController login - Login attempt with email:', loginDto.email);
    try {
      const result = await this.authService.login(req.user);
      console.log('AuthController login - Login successful');
      return result;
    } catch (error) {
      console.error('AuthController login - Login error:', error);
      throw error;
    }
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Temporary debug endpoint - REMOVE IN PRODUCTION
  @Get('debug/check-password/:email')
  async checkPasswordHash(@Param('email') email: string) {
    const user = await this.authService.findUserByEmail(email);
    if (!user) {
      return { exists: false };
    }
    return { 
      exists: true,
      passwordLength: user.password.length,
      isHashed: user.password.length > 20
    };
  }
}