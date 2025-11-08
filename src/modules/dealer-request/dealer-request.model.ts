import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { Dealer } from '../dealer/dealer.model';
import { VehicleVariant } from '../vehicle-variant/vehicle-variant.model';

export enum DealerVehicleRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PARTIAL = 'PARTIAL',
}

@Entity({ name: 'dealer_vehicle_requests' })
export class DealerVehicleRequest {
  @PrimaryGeneratedColumn()
  request_id!: number;

  @Column()
  dealer_id!: number;

  @ManyToOne(() => Dealer)
  @JoinColumn({ name: 'dealer_id' })
  dealer!: Dealer;

  @OneToMany(() => DealerVehicleRequestItem, (item) => item.request, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  items!: DealerVehicleRequestItem[];

  @Column({ type: 'varchar', length: 20, default: DealerVehicleRequestStatus.PENDING })
  status!: DealerVehicleRequestStatus;

  @CreateDateColumn({ type: 'datetime2' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'datetime2', nullable: true })
  updated_at!: Date;
}

@Entity({ name: 'dealer_vehicle_request_items' })
export class DealerVehicleRequestItem {
  @PrimaryGeneratedColumn()
  item_id!: number;

  @Column()
  request_id!: number;

  @ManyToOne(() => DealerVehicleRequest, (r) => r.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request!: DealerVehicleRequest;

  @Column()
  variant_id!: number;

  @ManyToOne(() => VehicleVariant)
  @JoinColumn({ name: 'variant_id' })
  variant!: VehicleVariant;

  @Column({ type: 'int' })
  requested_quantity!: number;

  @CreateDateColumn({ type: 'datetime2' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'datetime2', nullable: true })
  updated_at!: Date;
}
