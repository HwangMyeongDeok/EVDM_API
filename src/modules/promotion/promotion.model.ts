import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { Dealer } from '../dealer/dealer.model';
import { VehicleVariant } from '../vehicle-variant/vehicle-variant.model';

export enum PromotionApplicableTo {
  ALL = 'ALL',
  DEALER = 'DEALER',
  VARIANT = 'VARIANT',
  CUSTOMER = 'CUSTOMER',
}

export enum PromotionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  DRAFT = 'DRAFT',
}

@Entity({ name: 'promotions' })
export class Promotion {
  @PrimaryGeneratedColumn()
  promotion_id!: number;

  @Column({ nullable: true })
  dealer_id!: number;

  @ManyToOne(() => Dealer, { nullable: true })
  @JoinColumn({ name: 'dealer_id' })
  dealer!: Dealer;

  @Column({ nullable: true })
  variant_id!: number;

  @ManyToOne(() => VehicleVariant, { nullable: true })
  @JoinColumn({ name: 'variant_id' })
  variant!: VehicleVariant;

  @Column({ length: 50, unique: true })
  code!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  discount_amount!: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  discount_percentage!: number;

  @Column({ type: 'int', default: 0 })
  usage_limit!: number;

  @Column({ type: 'int', default: 0 })
  times_used!: number;

  @Column({ type: 'varchar', length: 20, default: PromotionApplicableTo.ALL })
  applicable_to!: PromotionApplicableTo;

  @Column({ type: 'varchar', length: 20, default: PromotionStatus.DRAFT })
  status!: PromotionStatus;

  @Column({ type: 'timestamp', nullable: true })
  start_date!: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_date!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at!: Date;
}
