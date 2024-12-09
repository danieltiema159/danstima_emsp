import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../users/entities/role.enum';

@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  async create(@Request() req, @Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto, req.user.userId);
  }

  @Get()
  async findAll(@Request() req) {
    if (req.user.roles.includes(Role.Admin)) {
      return this.vehiclesService.findAll();
    }
    return this.vehiclesService.findByUser(req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const vehicle = await this.vehiclesService.findOne(+id);
    if (vehicle.owner.id !== req.user.userId && !req.user.roles.includes(Role.Admin)) {
      throw new UnauthorizedException();
    }
    return vehicle;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto, @Request() req) {
    const vehicle = await this.vehiclesService.findOne(+id);
    if (vehicle.owner.id !== req.user.userId && !req.user.roles.includes(Role.Admin)) {
      throw new UnauthorizedException();
    }
    return this.vehiclesService.update(+id, updateVehicleDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const vehicle = await this.vehiclesService.findOne(+id);
    if (vehicle.owner.id !== req.user.userId && !req.user.roles.includes(Role.Admin)) {
      throw new UnauthorizedException();
    }
    return this.vehiclesService.remove(+id);
  }
}