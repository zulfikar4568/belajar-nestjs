import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class EditPostDto {
  @ApiProperty({example: 'Post Pertama hasil Edit', description: 'Masukan judul Post di sini yang mau di edit'})
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({required: false, example: "Ini adalah Post Pertama hasil Edit", description:"Masukan description di sini yang mau di edit"})
  @IsString()
  @IsOptional()
  description?: string;
}