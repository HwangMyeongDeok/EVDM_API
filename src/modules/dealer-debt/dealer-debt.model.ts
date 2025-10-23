import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { Dealer } from '../dealer/dealer.model';

export enum DealerDebtStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

@Entity({ name: 'dealer_debts' })
export class DealerDebt {
  @PrimaryGeneratedColumn()
  debt_id!: number;

  @Column()
  dealer_id!: number;

  @ManyToOne(() => Dealer)
  @JoinColumn({ name: 'dealer_id' })
  dealer!: Dealer;

  @Column('decimal', { precision: 15, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 20, default: DealerDebtStatus.PENDING })
  status!: DealerDebtStatus;

  @Column({ type: 'timestamp', nullable: true })
  due_date!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at!: Date;
}
