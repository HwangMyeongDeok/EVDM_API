import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn
} from 'typeorm';
import { Quotation } from '../quotation/quotation.model';
import { VehicleVariant } from '../vehicle-variant/vehicle-variant.model';

@Entity({ name: 'quotation_items' })
export class QuotationItem {
  @PrimaryGeneratedColumn()
  item_id!: number;

  @Column()
  quotation_id!: number;

  @ManyToOne(() => Quotation, (q) => q.items)
  @JoinColumn({ name: 'quotation_id' })
  quotation!: Quotation;

  @Column()
  variant_id!: number;

  @ManyToOne(() => VehicleVariant)
  @JoinColumn({ name: 'variant_id' })
  variant!: VehicleVariant;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column('decimal', { precision: 15, scale: 2 })
  unit_price!: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0.0 })
  discount_amount!: number;

  @Column('decimal', { precision: 15, scale: 2 })
  line_total!: number;
}
