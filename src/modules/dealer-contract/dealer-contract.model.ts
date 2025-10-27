import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { Dealer } from '../dealer/dealer.model';

export enum DealerContractStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
}

@Entity({ name: 'dealer_contracts' })
export class DealerContract {
  @PrimaryGeneratedColumn()
  dealer_contract_id!: number;

  @Column({ length: 50, unique: true, nullable: true })
  contract_code!: string;

  @Column()
  dealer_id!: number;

  @ManyToOne(() => Dealer, (dealer) => dealer.contracts)
  @JoinColumn({ name: 'dealer_id' })
  dealer!: Dealer;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  sales_target!: number;

  @Column({ nullable: true })
  target_units!: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  discount_rate!: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  credit_limit!: number;

  @Column({ type: 'varchar', length: 20, default: DealerContractStatus.ACTIVE })
  status!: DealerContractStatus;

  @Column({ type: 'date', nullable: true })
  start_date!: Date;

  @Column({ type: 'date', nullable: true })
  end_date!: Date;

  @Column({ type: 'text', nullable: true })
  remarks!: string;

  @CreateDateColumn({ type: 'datetime2' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'datetime2', nullable: true })
  updated_at!: Date;
}
