import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
  OneToMany
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

  @Column({ nullable: false })
  request_id!: number;

  @ManyToOne(() => DealerVehicleRequest, (request) => request.allocations  ,{ nullable: false })
  @JoinColumn({ name: 'request_id' })
  request!: DealerVehicleRequest;

  @Column()
  dealer_id!: number;

  @ManyToOne(() => Dealer)
  @JoinColumn({ name: 'dealer_id' })
  dealer!: Dealer;

  @Column({ type: 'int', nullable: true })
  delivery_batch!: number;

  @Column({ type: 'datetime2', nullable: true })
  delivery_date!: Date;

  @Column({ type: 'varchar', length: 20, default: AllocationStatus.PENDING })
  status!: AllocationStatus;

  @OneToMany(() => DealerVehicleAllocationItem, (item) => item.allocation, { cascade: true })
  items!: DealerVehicleAllocationItem[];

  @Column({ type: 'text', nullable: true })
  notes?: string; 

  @Column({ type: 'datetime2', default: () => 'CURRENT_TIMESTAMP' })
  allocation_date!: Date;

  @CreateDateColumn({ type: 'datetime2' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'datetime2', nullable: true })
  updated_at!: Date;
}

@Entity({ name: 'dealer_vehicle_allocation_items' })
export class DealerVehicleAllocationItem {
  @PrimaryGeneratedColumn()
  item_id!: number;

  @Column()
  allocation_id!: number;

  @ManyToOne(() => DealerVehicleAllocation, (alloc) => alloc.items)
  @JoinColumn({ name: 'allocation_id' })
  allocation!: DealerVehicleAllocation;

  @Column()
  variant_id!: number; 

  @ManyToOne(() => VehicleVariant) 
  @JoinColumn({ name: 'variant_id' })
  variant!: VehicleVariant;

  @Column()
  quantity!: number;
}