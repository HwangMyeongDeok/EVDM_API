import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { Dealer } from '../dealer/dealer.model';
import { VehicleVariant } from '../vehicle-variant/vehicle-variant.model';
import { DealerVehicleRequest } from '../dealer-request/dealer-request.model';

export enum AllocationStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
}

@Entity({ name: 'dealer_vehicle_allocations' })
export class DealerVehicleAllocation {
  @PrimaryGeneratedColumn()
  allocation_id!: number;

  @Column({ nullable: true })
  request_id!: number;

  @ManyToOne(() => DealerVehicleRequest, { nullable: true })
  @JoinColumn({ name: 'request_id' })
  request!: DealerVehicleRequest;

  @Column()
  dealer_id!: number;

  @ManyToOne(() => Dealer)
  @JoinColumn({ name: 'dealer_id' })
  dealer!: Dealer;

  @Column()
  variant_id!: number;

  @ManyToOne(() => VehicleVariant)
  @JoinColumn({ name: 'variant_id' })
  variant!: VehicleVariant;

  @Column({ type: 'int' })
  allocated_quantity!: number;

  @Column({ type: 'int', nullable: true })
  delivery_batch!: number;

  @Column({ type: 'timestamp', nullable: true })
  delivery_date!: Date;

  @Column({ type: 'varchar', length: 20, default: AllocationStatus.PENDING })
  status!: AllocationStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  allocation_date!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at!: Date;
}
