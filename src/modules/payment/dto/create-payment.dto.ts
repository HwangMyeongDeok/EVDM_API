export class CreatePaymentDto {
  contract_id?: number;
  customer_id?: number;
  amount!: number;
  payment_method!: 'BANK_TRANSFER' | 'CASH' | 'CREDIT_CARD';
  payment_type?: 'FULL' | 'INSTALLMENT' | 'DEPOSIT';
  transaction_id?: string;
}