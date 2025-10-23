  import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm";
  import { Vehicle } from "../vehicles/vehicle.model";
  import { VehicleUnit } from "../vehicle-unit/vehicle-unit.model";
  import { Inventory } from "../inventory/inventory.model";

  export enum VehicleVariantStatus {
    ACTIVE = "ACTIVE",
    DISCONTINUED = "DISCONTINUED",
  }

  @Entity({ name: "vehicle_variants" })
  export class VehicleVariant {
    @PrimaryGeneratedColumn()
    variant_id!: number;

    @Column()
    vehicle_id!: number;

    @ManyToOne(() => Vehicle, (vehicle) => vehicle.variants)
    @JoinColumn({ name: "vehicle_id" })
    vehicle!: Vehicle;

    @Column({ length: 50, nullable: true })
    version!: string;

    @Column({ length: 50, nullable: true })
    color!: string;

    @Column("decimal", { precision: 15, scale: 2 })
    dealer_price!: number;

    @Column("decimal", { precision: 15, scale: 2 })
    base_price!: number;

    @Column("decimal", { precision: 15, scale: 2, nullable: true })
    retail_price!: number;

    @Column("decimal", { precision: 5, scale: 2, default: 0.0 })
    discount_percent!: number;

    @Column({ default: 2025 })
    model_year!: number;

    @Column("decimal", { precision: 6, scale: 2, nullable: true })
    battery_capacity_kwh!: number;

    @Column({ nullable: true })
    range_km!: number;

    @Column("decimal", { precision: 6, scale: 2, nullable: true })
    motor_power_kw!: number;

    @Column("decimal", { precision: 4, scale: 2, nullable: true })
    acceleration_0_100!: number;

    @Column({ nullable: true })
    top_speed_kmh!: number;

    @Column("decimal", { precision: 4, scale: 2, nullable: true })
    charging_time_hours!: number;

    @Column({ type: "varchar", length: 20, default: VehicleVariantStatus.ACTIVE })
    status!: VehicleVariantStatus;

    @OneToMany(() => VehicleUnit, (unit) => unit.variant)
    units!: VehicleUnit[];

    @OneToMany(() => Inventory, (inv) => inv.variant)
    inventory!: Inventory[];

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn({ nullable: true })
    updated_at!: Date;
  }
