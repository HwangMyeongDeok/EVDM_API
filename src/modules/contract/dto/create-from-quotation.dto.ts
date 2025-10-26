export class CreateFromQuotationDto {
  delivery_date?: string;
  payment_plan!: "FULL" | "DEPOSIT";
  deposit_amount?: number;
}