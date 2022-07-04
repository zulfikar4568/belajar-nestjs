import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    example: 'Post Pertama',
    description: 'Masukan judul Post di sini',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    required: false,
    example: 'Ini adalah Post Pertama',
    description: 'Masukan description di sini',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
