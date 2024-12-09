import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
    private usersService: UsersService,
  ) {}

  async create(createVehicleDto: CreateVehicleDto, userId: number): Promise<Vehicle> {
    const user = await this.usersService.findById(userId);
    const vehicle = this.vehiclesRepository.create({
      ...createVehicleDto,
      owner: user,
    });
    return this.vehiclesRepository.save(vehicle);
  }

  findAll(): Promise<Vehicle[]> {
    return this.vehiclesRepository.find({ relations: ['owner'] });
  }

  findByUser(userId: number): Promise<Vehicle[]> {
    return this.vehiclesRepository.find({ where: { owner: { id: userId } }, relations: ['owner'] });
  }

  async findOne(id: number): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findOne({ where: { id }, relations: ['owner'] });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    return vehicle;
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    Object.assign(vehicle, updateVehicleDto);
    return this.vehiclesRepository.save(vehicle);
  }

  async remove(id: number): Promise<void> {
    await this.vehiclesRepository.delete(id);
  }
}