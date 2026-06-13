import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum Role {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
}

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Role)
  role: Role;
}
