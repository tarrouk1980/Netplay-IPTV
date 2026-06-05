import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsString()
  category: string;

  @IsNumber()
  @Min(0)
  stock: number;
}
