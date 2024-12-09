import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  readonly type!: string;

  @IsNumber()
  readonly batteryCapacity: number;

  @IsNumber()
  readonly range: number;

  @IsOptional()
  @IsString()
  readonly specifications?: string;
}