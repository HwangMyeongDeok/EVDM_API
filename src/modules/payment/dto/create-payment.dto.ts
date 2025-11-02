import { PaymentMethod, PaymentType, PaymentContext } from "../payment.model";

export class CreatePaymentDto {
  contract_id?: number;
  customer_id?: number;
  amount!: number;
  payment_method!: PaymentMethod;
  payment_type?: PaymentType;
  transaction_id?: string;
  payment_context!: PaymentContext;
  total_amount?: number;
}
