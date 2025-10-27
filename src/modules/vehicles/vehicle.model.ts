import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { VehicleVariant } from "../vehicle-variant/vehicle-variant.model";

export enum VehicleBodyType {
  SUV = "SUV",
  Sedan = "Sedan",
  Hatchback = "Hatchback",
  Crossover = "Crossover",
  Pickup = "Pickup",
  MPV = "MPV",
}

@Entity({ name: "vehicles" })
export class Vehicle {
  @PrimaryGeneratedColumn()
  vehicle_id!: number;

  @Column({ length: 100 })
  model_name!: string;

  @Column({ type: "text", nullable: true })
  specifications!: string;

  @Column({ type: "varchar", length: 20 })
  body_type!: VehicleBodyType;

  @Column({ default: 5 })
  seats!: number;

  @Column({ default: 5 })
  doors!: number;

  @Column({ default: 10 })
  warranty_years!: number;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({ type: "simple-json", nullable: true })
  image_urls!: string[];

  @CreateDateColumn({ type: "datetime2" })
  created_at!: Date;

  @UpdateDateColumn({ type: "datetime2", nullable: true })
  updated_at!: Date;

  @OneToMany(() => VehicleVariant, (variant) => variant.vehicle, {
    cascade: true,
  })
  variants!: VehicleVariant[];
}
