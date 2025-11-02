export class CreateQuotationDto {
  customer_id?: number;
  customer?: { 
    full_name: string;
    phone: string;
    email: string;
    address?: string;
    paymentTerms?: string;
    notes?: string;
  };

  variant_id!: number;
  notes?: string;
}
