import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn
} from 'typeorm';
import { Customer } from '../customer/customer.model';

export enum DocumentType {
  CCCD_FRONT = 'CCCD_FRONT',
  CCCD_BACK = 'CCCD_BACK',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
  HOUSEHOLD_REGISTRATION = 'HOUSEHOLD_REGISTRATION',
  UTILITY_BILL = 'UTILITY_BILL',
  OTHER = 'OTHER',
}

@Entity({ name: 'customer_attachments' })
export class CustomerAttachment {
  @PrimaryGeneratedColumn()
  attachment_id!: number;

  @Column()
  customer_id!: number;

  @ManyToOne(() => Customer, (customer) => customer.attachments)
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @Column({
    type: 'varchar',
    length: 30,
  })
  document_type!: DocumentType;

  @Column({ type: 'text' })
  attachment_url!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploaded_at!: Date;
}
