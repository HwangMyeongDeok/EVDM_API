import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { VehicleVariant } from '../vehicle-variant/vehicle-variant.model';
import { Dealer } from '../dealer/dealer.model';

export enum VehicleUnitStatus {
  IN_TRANSIT = 'IN_TRANSIT',
  IN_DEALER = 'IN_DEALER',
  SOLD = 'SOLD',
}

@Entity({ name: 'vehicle_units' })
export class VehicleUnit {
  @PrimaryGeneratedColumn()
  unit_id!: number;

  @Column()
  variant_id!: number;

  @ManyToOne(() => VehicleVariant, (variant) => variant.units)
  @JoinColumn({ name: 'variant_id' })
  variant!: VehicleVariant;

  @Column({ length: 100, unique: true })
  vin!: string;

  @Column({ nullable: true })
  dealer_id!: number;

  @ManyToOne(() => Dealer, (dealer) => dealer.dealer_id, { nullable: true })
  @JoinColumn({ name: 'dealer_id' })
  dealer!: Dealer;

  @Column({ type: 'date', nullable: true })
  import_date!: Date;

  @Column({ length: 20, nullable: true })
  license_plate!: string;

  @Column({ type: 'varchar', length: 20, default: VehicleUnitStatus.IN_TRANSIT })
  status!: VehicleUnitStatus;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at!: Date;
}
