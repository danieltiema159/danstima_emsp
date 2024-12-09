import { IsEmail, IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsArray()
  @IsOptional()
  roles?: string[];
} 