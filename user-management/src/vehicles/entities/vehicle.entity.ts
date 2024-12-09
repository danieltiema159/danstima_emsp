import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column('float')
  batteryCapacity: number;

  @Column('float')
  range: number;

  @Column({ nullable: true })
  specifications: string;

  @ManyToOne(() => User, user => user.vehicles, { onDelete: 'CASCADE' })
  owner: User;
}