import { AppError } from "../../common/middlewares/AppError";
import QuotationRepository from "./quotation.repository";
import { Quotation } from "./quotation.model";
import { CreateQuotationDto } from "./dto/create-quotation.dto";
import { UpdateQuotationDto } from "./dto/update-quotation.dto";
import { AppDataSource } from "../../config/data-source";
import { VehicleVariant } from "../vehicle-variant/vehicle-variant.model";

export class QuotationService {
  private repo = QuotationRepository;
  private variantRepo = AppDataSource.getRepository(VehicleVariant);

  async create(
    dto: CreateQuotationDto,
    userId: number,
    dealerId: number
  ): Promise<Quotation> {
    if (!dto.variant_id) throw new AppError("Variant is required", 400);

    const variant = await this.variantRepo.findOne({
      where: { variant_id: dto.variant_id },
      relations: ["vehicle"],
    });
    if (!variant) throw new AppError("Variant not found", 404);

    const unitPrice = Number(variant.retail_price);
    const subtotal = unitPrice;
    const taxRate = 10;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    const quotation = new Quotation();
    quotation.quotation_number = this.generateCode();
    quotation.customer_id = dto.customer_id!;
    quotation.dealer_id = dealerId;
    quotation.user_id = userId;
    quotation.variant_id = variant.variant_id;
    quotation.subtotal = subtotal;
    quotation.tax_rate = taxRate;
    quotation.tax_amount = taxAmount;
    quotation.discount_total = 0;
    quotation.total_amount = totalAmount;
    quotation.notes = dto.notes || "";

    return await this.repo.save(quotation);
  }

  async update(
    id: number,
    dto: UpdateQuotationDto,
    dealerId: number
  ): Promise<Quotation> {
    const quotation = await this.repo.findById(id);
    if (!quotation || quotation.dealer_id !== dealerId)
      throw new AppError("Not found", 404);

    if (dto.variant_id) {
      const variant = await this.variantRepo.findOne({
        where: { variant_id: dto.variant_id },
      });
      if (!variant) throw new AppError("Variant not found", 404);

      const unitPrice = Number(variant.retail_price);
      const subtotal = unitPrice;
      const taxAmount = subtotal * 0.1;

      quotation.variant_id = dto.variant_id;
      quotation.subtotal = subtotal;
      quotation.tax_amount = taxAmount;
      quotation.total_amount = subtotal + taxAmount;
    }

    if (dto.notes !== undefined) quotation.notes = dto.notes || "";

    return await this.repo.save(quotation);
  }

  async send(id: number, dealerId: number): Promise<Quotation> {
    const quotation = await this.repo.findById(id);
    if (!quotation || quotation.dealer_id !== dealerId)
      throw new AppError("Not found", 404);

    return await this.repo.save(quotation);
  }

  async delete(id: number, dealerId: number): Promise<void> {
    const quotation = await this.repo.findById(id);
    if (!quotation || quotation.dealer_id !== dealerId)
      throw new AppError("Not found", 404);
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

  async getAll(): Promise<Quotation[]> {
    return this.repo.findAllWithRelations();
  }

  async getAllByUser(userId: number): Promise<Quotation[]> {
    return this.repo.findAllByUser(userId);
  }

  private generateCode(): string {
    return `Q-${Date.now()}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;
  }
}

export default new QuotationService();
