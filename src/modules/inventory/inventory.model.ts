import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn
} from 'typeorm';
import { Dealer } from '../dealer/dealer.model';
import { VehicleVariant } from '../vehicle-variant/vehicle-variant.model';

@Entity({ name: 'inventory' })
export class Inventory {
  @PrimaryGeneratedColumn()
  inventory_id!: number;

  @Column()
  variant_id!: number;

  @ManyToOne(() => VehicleVariant, (variant) => variant.inventory)
  @JoinColumn({ name: 'variant_id' })
  variant!: VehicleVariant;

  @Column({ nullable: true })
  dealer_id!: number | null;

  @ManyToOne(() => Dealer, { nullable: true })
  @JoinColumn({ name: 'dealer_id' })
  dealer!: Dealer;

  @Column({ default: 0 })
  quantity!: number;

  @CreateDateColumn({ type: 'datetime2' })
  last_updated!: Date;
}
