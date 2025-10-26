export class CreateQuotationDto {
  customer_id!: number;
  items!: Array<{
    variant_id: number;
    quantity: number;
  }>;
  notes?: string;
}