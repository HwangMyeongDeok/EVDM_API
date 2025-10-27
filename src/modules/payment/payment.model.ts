import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { Contract } from '../contract/contract.model';
import { Dealer } from '../dealer/dealer.model';
import { Customer } from '../customer/customer.model';

export enum PaymentType {
  FULL = 'FULL',
  INSTALLMENT = 'INSTALLMENT',
  DEPOSIT = 'DEPOSIT',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum PaymentContext {
  CUSTOMER = 'CUSTOMER',
  DEALER = 'DEALER',
}

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn()
  payment_id!: number;

  @Column({ nullable: true })
  contract_id!: number;

  @ManyToOne(() => Contract, { nullable: true })
  @JoinColumn({ name: 'contract_id' })
  contract!: Contract;

  @Column({ nullable: true })
  dealer_id!: number;

  @ManyToOne(() => Dealer, { nullable: true })
  @JoinColumn({ name: 'dealer_id' })
  dealer!: Dealer;

  @Column({ nullable: true })
  customer_id!: number;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @Column({ length: 100, nullable: true })
  transaction_id!: string;

  @Column('decimal', { precision: 15, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  payment_type!: PaymentType;

  @Column({ type: 'varchar', length: 20 })
  payment_method!: PaymentMethod;

  @Column({ type: 'varchar', length: 20, default: PaymentStatus.PENDING })
  payment_status!: PaymentStatus;

  @Column({ type: 'varchar', length: 20, default: PaymentContext.CUSTOMER })
  payment_context!: PaymentContext;

  @Column({ type: 'datetime2', default: () => 'CURRENT_TIMESTAMP' })
  payment_date!: Date;

  @CreateDateColumn({ type: 'datetime2' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'datetime2', nullable: true })
  updated_at!: Date;
}
