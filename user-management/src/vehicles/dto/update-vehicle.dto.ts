import { PartialType } from '@nestjs/mapped-types';
import { CreateVehicleDto } from './create-vehicle.dto';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {
  @IsOptional()
  @IsString()
  readonly type?: string;

  @IsOptional()
  @IsNumber()
  readonly batteryCapacity?: number;

  @IsOptional()
  @IsNumber()
  readonly range?: number;

  @IsOptional()
  @IsString()
  readonly specifications?: string;
}