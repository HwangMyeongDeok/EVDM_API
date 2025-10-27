import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Dealer } from "../dealer/dealer.model";

export enum UserRole {
  DEALER_STAFF = "DEALER_STAFF",
  DEALER_MANAGER = "DEALER_MANAGER",
  EVM_STAFF = "EVM_STAFF",
  ADMIN = "ADMIN",
}
@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  user_id!: number;

  @Column({ type: "nvarchar", length: 100, default: "" })
  email?: string;

  @Column({ select: false, type: "nvarchar", length: 255 })
  password!: string;

  @Column({
    type: "varchar",
    length: 30,
    default: UserRole.DEALER_STAFF,
  })
  role!: UserRole;

  @Column({ nullable: true })
  dealer_id!: number;

  @ManyToOne(() => Dealer, (dealer) => dealer.users, { nullable: true })
  @JoinColumn({ name: "dealer_id" })
  dealer!: Dealer;

  @Column({ length: 100, nullable: true })
  full_name!: string;

  @Column({ length: 20, nullable: true })
  phone!: string;

  @Column({ type: "text", nullable: true })
  avatar_url!: string;

  @CreateDateColumn({ type: "datetime2", default: () => "CURRENT_TIMESTAMP" })
  created_at!: Date;

  @UpdateDateColumn({ type: "datetime2", nullable: true })
  updated_at!: Date;
}
