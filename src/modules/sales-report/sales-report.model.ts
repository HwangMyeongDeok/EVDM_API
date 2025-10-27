import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn
} from 'typeorm';
import { Dealer } from '../dealer/dealer.model';
import { User } from '../user/user.model';

@Entity({ name: 'sales_reports' })
export class SalesReport {
  @PrimaryGeneratedColumn()
  report_id!: number;

  @Column({ nullable: true })
  dealer_id!: number;

  @ManyToOne(() => Dealer, { nullable: true })
  @JoinColumn({ name: 'dealer_id' })
  dealer!: Dealer;

  @Column({ nullable: true })
  user_id!: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'datetime2' })
  period_start!: Date;

  @Column({ type: 'datetime2' })
  period_end!: Date;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  total_sales!: number;

  @Column({ type: 'int', nullable: true })
  total_orders!: number;

  @CreateDateColumn({ type: 'datetime2' })
  created_at!: Date;
}
