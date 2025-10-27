import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany,
  JoinColumn, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { Dealer } from '../dealer/dealer.model';
import { CustomerAttachment } from '../customer-attachment/customer-attachment.model';

@Entity({ name: 'customers' })
export class Customer {
  @PrimaryGeneratedColumn()
  customer_id!: number;

  @Column({ length: 100 })
  full_name!: string;

  @Column({ length: 20, nullable: true, unique: true })
  phone!: string;

  @Column({ length: 100, nullable: true })
  email!: string;

  @Column({ type: 'text', nullable: true })
  address!: string;

  @Column()
  dealer_id!: number;

  @ManyToOne(() => Dealer)
  @JoinColumn({ name: 'dealer_id' })
  dealer!: Dealer;

  @OneToMany(() => CustomerAttachment, (att) => att.customer)
  attachments!: CustomerAttachment[];

  @CreateDateColumn({ type: 'datetime2' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'datetime2', nullable: true })
  updated_at!: Date;
}
