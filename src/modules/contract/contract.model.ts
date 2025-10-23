import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from "typeorm";
import { Dealer } from "../dealer/dealer.model";
import { Customer } from "../customer/customer.model";
import { User } from "../user/user.model";
import { ContractItem } from "../contract-item/contract-item.model";
import { Quotation } from "../quotation/quotation.model";

export enum ContractStatus {
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  PENDING_SIGN = "PENDING_SIGN",
  SIGNED = "SIGNED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  UNPAID = "UNPAID",
  PARTIAL = "PARTIAL",
  PAID = "PAID",
}

export enum PaymentPlan {
  FULL = "FULL",
  DEPOSIT = "DEPOSIT",
}

@Entity({ name: "contracts" })
export class Contract {
  @PrimaryGeneratedColumn()
  contract_id!: number;

  @Column({ length: 50, unique: true })
  contract_code!: string;

  @Column({ nullable: true })
  quotation_id!: number;

  @Column()
  dealer_id!: number;

  @ManyToOne(() => Dealer)
  @JoinColumn({ name: "dealer_id" })
  dealer!: Dealer;

  @Column()
  customer_id!: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: "customer_id" })
  customer!: Customer;

  @Column()
  user_id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @OneToMany(() => ContractItem, (item) => item.contract)
  items!: ContractItem[];

  @Column({ nullable: true })
  approved_by!: number;

  @Column({ type: "date" })
  contract_date!: Date;

  @Column({ type: "date", nullable: true })
  delivery_date!: Date;

  @Column({ type: "varchar", length: 30, default: ContractStatus.DRAFT })
  status!: ContractStatus;

  @Column("decimal", { precision: 15, scale: 2 })
  total_amount!: number;

  @Column("decimal", { precision: 15, scale: 2, default: 0.0 })
  discount_amount!: number;

  @Column("decimal", { precision: 15, scale: 2 })
  final_amount!: number;

  @Column({ type: "varchar", length: 20, default: PaymentStatus.UNPAID })
  payment_status!: PaymentStatus;

  @Column({ type: "varchar", length: 20, default: PaymentPlan.FULL })
  payment_plan!: PaymentPlan;

  @Column("decimal", { precision: 15, scale: 2, default: 0.0 })
  deposit_amount!: number;

  @Column("decimal", { precision: 15, scale: 2, default: 0.0 })
  remaining_amount!: number;

  @OneToOne(() => Quotation, (quotation) => quotation.contract)
  @JoinColumn({ name: "quotation_id" })
  quotation!: Quotation;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp", nullable: true })
  updated_at!: Date;
}
