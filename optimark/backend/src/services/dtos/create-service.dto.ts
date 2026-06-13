import { IsNumber, IsString, Min } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  category: string;
}
