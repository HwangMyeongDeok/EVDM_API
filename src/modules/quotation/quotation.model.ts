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
import { Customer } from "../customer/customer.model";
import { Dealer } from "../dealer/dealer.model";
import { User } from "../user/user.model";
import { Contract } from "../contract/contract.model";
import { VehicleVariant } from "../vehicle-variant/vehicle-variant.model";

export enum QuotationStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

@Entity({ name: "quotations" })
export class Quotation {
  @PrimaryGeneratedColumn()
  quotation_id!: number;

  @Column({ length: 50, unique: true, nullable: true })
  quotation_number!: string;

  @Column()
  customer_id!: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: "customer_id" })
  customer!: Customer;

  @Column()
  dealer_id!: number;

  @ManyToOne(() => Dealer)
  @JoinColumn({ name: "dealer_id" })
  dealer!: Dealer;

  @Column()
  user_id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column()
  variant_id!: number;

  @ManyToOne(() => VehicleVariant)
  @JoinColumn({ name: "variant_id" })
  variant!: VehicleVariant;

  @Column({ type: "varchar", length: 20, default: QuotationStatus.DRAFT })
  status!: QuotationStatus;

  @Column("decimal", { precision: 15, scale: 2, nullable: true })
  subtotal!: number;

  @Column("decimal", { precision: 5, scale: 2, default: 10.0 })
  tax_rate!: number;

  @Column("decimal", { precision: 15, scale: 2, nullable: true })
  tax_amount!: number;

  @Column("decimal", { precision: 15, scale: 2, default: 0.0 })
  discount_total!: number;

  @Column("decimal", { precision: 15, scale: 2, nullable: true })
  total_amount!: number;

  @Column({ type: "text", nullable: true })
  notes!: string;

  @Column({ nullable: true })
  approved_by!: number;

  @OneToOne(() => Contract, (contract) => contract.quotation)
  contract!: Contract;

  @CreateDateColumn({ type: "datetime2" })
  created_at!: Date;

  @UpdateDateColumn({ type: "datetime2", nullable: true })
  updated_at!: Date;
}
