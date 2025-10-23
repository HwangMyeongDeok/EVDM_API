import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class QuotationItemDto {
  @IsInt()
  @IsNotEmpty()
  variantId!: number;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateQuotationDto {
  @IsInt()
  @IsNotEmpty()
  customerId!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items!: QuotationItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateQuotationDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  status?: "DRAFT" | "SENT" | "APPROVED" | "REJECTED";

  @IsOptional()
  @IsNumber()
  discount_total?: number;

  @IsOptional()
  @IsNumber()
  total_amount?: number;
}
