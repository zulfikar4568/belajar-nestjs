import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class AuthDto {
  @ApiProperty({
    example: 'isnaen@gmail.com',
    description: 'Masukan email kamu di sini',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Masukan password kamu di sini',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
