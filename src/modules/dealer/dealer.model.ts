import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../user/user.model";
import { DealerContract } from "../dealer-contract/dealer-contract.model";
import { VehicleUnit } from "../vehicle-unit/vehicle-unit.model";
import { Inventory } from "../inventory/inventory.model";
import { DealerVehicleRequest } from "../dealer-request/dealer-request.model";
import { DealerVehicleAllocation } from "../dealer-allocation/dealer-allocation.model";
import { Customer } from "../customer/customer.model";
import { Quotation } from "../quotation/quotation.model";
import { Contract } from "../contract/contract.model";
import { Payment } from "../payment/payment.model";
import { DealerDebt } from "../dealer-debt/dealer-debt.model";
import { Promotion } from "../promotion/promotion.model";
import { SalesReport } from "../sales-report/sales-report.model";

@Entity({ name: "dealers" })
export class Dealer {
  @PrimaryGeneratedColumn()
  dealer_id!: number;

  @Column({ length: 100 })
  dealer_name!: string;

  @Column({ type: "text", nullable: true })
  address!: string;

  @Column({ length: 20, nullable: true })
  phone!: string;

  @Column({ length: 100, nullable: true })
  email!: string;

  @OneToMany(() => User, (user) => user.dealer)
  users!: User[];

  @OneToMany(() => DealerContract, (contract) => contract.dealer)
  dealerContracts!: DealerContract[];

  @OneToMany(() => VehicleUnit, (unit) => unit.dealer)
  units!: VehicleUnit[];

  @OneToMany(() => Inventory, (inv) => inv.dealer)
  inventory!: Inventory[];

  @OneToMany(() => DealerVehicleRequest, (req) => req.dealer)
  vehicleRequests!: DealerVehicleRequest[];

  @OneToMany(() => DealerVehicleAllocation, (alloc) => alloc.dealer)
  vehicleAllocations!: DealerVehicleAllocation[];

  @OneToMany(() => Customer, (cust) => cust.dealer)
  customers!: Customer[];

  @OneToMany(() => Quotation, (quote) => quote.dealer)
  quotations!: Quotation[];

  @OneToMany(() => Contract, (contract) => contract.dealer)
  contracts!: Contract[];

  @OneToMany(() => Payment, (payment) => payment.dealer)
  payments!: Payment[];

  @OneToMany(() => DealerDebt, (debt) => debt.dealer)
  debts!: DealerDebt[];

  @OneToMany(() => Promotion, (promo) => promo.dealer)
  promotions!: Promotion[];

  @OneToMany(() => SalesReport, (report) => report.dealer)
  reports!: SalesReport[];

  @CreateDateColumn({ type: "datetime2", default: () => "CURRENT_TIMESTAMP" })
  created_at!: Date;

  @UpdateDateColumn({ type: "datetime2", nullable: true })
  updated_at!: Date;
}
