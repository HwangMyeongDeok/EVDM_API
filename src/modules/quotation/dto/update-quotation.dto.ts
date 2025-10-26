export class UpdateQuotationDto {
  items?: Array<{
    variant_id: number;
    quantity: number;
  }>;
  notes?: string;
}