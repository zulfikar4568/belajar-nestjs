import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class EditUserDto {
  @ApiProperty({required: false, example: "isnaen25@gmail.com", description:"Masukan email yang mau di edit"})
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({required: false, example: "Zulfikar", description:"Masukan FirstName yang mau di edit"})
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({required: false, example: "Isnaen", description:"Masukan lastName yang mau di edit"})
  @IsString()
  @IsOptional()
  lastName?: string;
}