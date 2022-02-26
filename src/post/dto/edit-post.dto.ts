import { IsOptional, IsString } from "class-validator";

export class EditPostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}