import { AppError } from "../../common/middlewares/AppError";
import QuotationRepository from "./quotation.repository";
import { Quotation, QuotationStatus } from "./quotation.model";
import { QuotationItem } from "../quotation-item/quotation-item.model";
import { CreateQuotationDto } from "./dto/create-quotation.dto";
import { UpdateQuotationDto } from "./dto/update-quotation.dto";
import { AppDataSource } from "../../config/data-source";

export class QuotationService {
  private repo = QuotationRepository;
  private variantRepo = AppDataSource.getRepository("VehicleVariant");

  async create(dto: CreateQuotationDto, userId: number, dealerId: number): Promise<Quotation> {
    if (!dto.items?.length) throw new AppError("Items required", 400);

    const items: QuotationItem[] = [];
    let subtotal = 0;

    for (const item of dto.items) {
      const variant: any = await this.variantRepo.findOne({
        where: { variant_id: item.variant_id },
        relations: ["vehicle"],
      });
      if (!variant) throw new AppError(`Variant ${item.variant_id} not found`, 404);

      const unitPrice = Number(variant.retail_price);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      const qi = new QuotationItem();
      qi.variant_id = variant.variant_id;
      qi.quantity = item.quantity;
      qi.unit_price = unitPrice;
      qi.line_total = lineTotal;
      qi.description = `${variant.vehicle.model_name} - ${variant.version}`;
      qi.discount_amount = 0;
      items.push(qi);
    }

    const taxRate = 10;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    const quotation = new Quotation();
    quotation.quotation_number = this.generateCode();
    quotation.customer_id = dto.customer_id;
    quotation.dealer_id = dealerId;
    quotation.user_id = userId;
    quotation.status = QuotationStatus.DRAFT;
    quotation.subtotal = subtotal;
    quotation.tax_rate = taxRate;
    quotation.tax_amount = taxAmount;
    quotation.discount_total = 0;
    quotation.total_amount = totalAmount;
    quotation.notes = dto.notes || "";
    quotation.items = items;

    return await this.repo.save(quotation);
  }

  async update(id: number, dto: UpdateQuotationDto, dealerId: number): Promise<Quotation> {
    const quotation = await this.repo.findById(id);
    if (!quotation || quotation.dealer_id !== dealerId) throw new AppError("Not found", 404);
    if (quotation.status !== QuotationStatus.DRAFT) throw new AppError("Cannot update", 400);

    if (dto.items) {
      const items: QuotationItem[] = [];
      let subtotal = 0;

      for (const item of dto.items) {
        const variant: any = await this.variantRepo.findOne({ where: { variant_id: item.variant_id } });
        if (!variant) throw new AppError(`Variant ${item.variant_id} not found`, 404);

        const lineTotal = Number(variant.retail_price) * item.quantity;
        subtotal += lineTotal;

        const qi = new QuotationItem();
        qi.variant_id = variant.variant_id;
        qi.quantity = item.quantity;
        qi.unit_price = Number(variant.retail_price);
        qi.line_total = lineTotal;
        items.push(qi);
      }

      const taxAmount = subtotal * 0.1;
      quotation.subtotal = subtotal;
      quotation.tax_amount = taxAmount;
      quotation.total_amount = subtotal + taxAmount;
      quotation.items = items;
    }

    if (dto.notes !== undefined) quotation.notes = dto.notes || "";

    return await this.repo.save(quotation);
  }

  async send(id: number, dealerId: number): Promise<Quotation> {
    const quotation = await this.repo.findById(id);
    if (!quotation || quotation.dealer_id !== dealerId) throw new AppError("Not found", 404);
    if (quotation.status !== QuotationStatus.DRAFT) throw new AppError("Invalid status", 400);

    quotation.status = QuotationStatus.SENT;
    return await this.repo.save(quotation);
  }

  async approve(id: number, managerId: number, dealerId: number): Promise<Quotation> {
    const quotation = await this.repo.findById(id);
    if (!quotation || quotation.dealer_id !== dealerId) throw new AppError("Not found", 404);
    if (quotation.status !== QuotationStatus.SENT) throw new AppError("Invalid status", 400);

    quotation.status = QuotationStatus.APPROVED;
    quotation.approved_by = managerId;
    return await this.repo.save(quotation);
  }

  async delete(id: number, dealerId: number): Promise<void> {
    const quotation = await this.repo.findById(id);
    if (!quotation || quotation.dealer_id !== dealerId) throw new AppError("Not found", 404);
    if (quotation.status !== QuotationStatus.DRAFT) throw new AppError("Cannot delete", 400);
    await this.repo.delete(id);
  }

  async getById(id: number): Promise<Quotation> {
    const q = await this.repo.findById(id);
    if (!q) throw new AppError("Not found", 404);
    return q;
  }

  async getAllByDealer(dealerId: number): Promise<Quotation[]> {
    return this.repo.findAllByDealer(dealerId);
  }

  private generateCode(): string {
    return `Q-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
  }
}

export default new QuotationService();