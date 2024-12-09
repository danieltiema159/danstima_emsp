import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Role } from './role.enum';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({  //changelog
    type: 'enum',
    enum: Role,
    array: true,
    default: [Role.User]
  })
  roles: Role[];

  @OneToMany(() => Vehicle, vehicle => vehicle.owner)
  vehicles: Vehicle[];
}