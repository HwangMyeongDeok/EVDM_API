export class CreateManualDto {
  customer_id!: number;
  delivery_date?: string;
  payment_plan!: "FULL" | "DEPOSIT";
  deposit_amount?: number;
  total_amount!: number;
  items!: Array<{
    variant_id: number;
    quantity: number;
    unit_price: number;
    color?: string;
    description?: string;
  }>;
}