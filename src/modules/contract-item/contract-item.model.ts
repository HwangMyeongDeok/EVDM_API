import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Contract } from "../contract/contract.model";
import { VehicleVariant } from "../vehicle-variant/vehicle-variant.model";

@Entity({ name: "contract_items" })
export class ContractItem {
  @PrimaryGeneratedColumn()
  item_id!: number;

  @Column()
  contract_id!: number;

  @ManyToOne(() => Contract, (c) => c.items)
  @JoinColumn({ name: "contract_id" })
  contract!: Contract;

  @Column()
  variant_id!: number;

  @ManyToOne(() => VehicleVariant)
  @JoinColumn({ name: "variant_id" })
  variant!: VehicleVariant;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({ length: 50, nullable: true })
  color!: string;

  @Column({ type: "int" })
  quantity!: number;

  @Column("decimal", { precision: 15, scale: 2 })
  unit_price!: number;

  @Column("decimal", { precision: 15, scale: 2, default: 0.0 })
  discount_amount!: number;

  @Column("decimal", { precision: 15, scale: 2 })
  line_total!: number;

  @OneToMany(() => ContractItem, (item) => item.contract, { cascade: true })
  items!: ContractItem[];
}
