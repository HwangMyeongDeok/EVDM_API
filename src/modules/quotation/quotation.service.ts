import { AppError } from "../../common/middlewares/AppError";
import { Quotation, QuotationStatus } from "./quotation.model";
import QuotationRepository from "./quotation.repository";
import { CreateQuotationDto } from "./quotation.dto";
import { AppDataSource } from "../../config/data-source";
import { VehicleVariant } from "../vehicle-variant/vehicle-variant.model";
import { Customer } from "../customer/customer.model";
import { Dealer } from "../dealer/dealer.model";
import { User } from "../user/user.model";
import { QuotationItem } from "../quotation-item/quotation-item.model";

export class QuotationService {
  private quotationRepo = QuotationRepository;
  private variantRepo = AppDataSource.getRepository(VehicleVariant);

  // 🟢 Tạo mới báo giá
  public async create(
    userId: number,
    dealerId: number,
    input: CreateQuotationDto
  ): Promise<Quotation> {
    if (!input.items?.length) {
      throw new AppError("Quotation must have at least one item", 400);
    }

    const processedItems = [];

    for (const item of input.items) {
      const variant = await this.variantRepo.findOne({
        where: { variant_id: item.variantId },
        relations: ["vehicle"],
      });

      if (!variant) {
        throw new AppError(`No variant found with id ${item.variantId}`, 404);
      }

      const unitPrice = Number(variant.retail_price);
      if (isNaN(unitPrice) || unitPrice <= 0) {
        throw new AppError(`Invalid price for variant ${item.variantId}`, 400);
      }

      const lineTotal = item.quantity * unitPrice;

      processedItems.push({
        variant,
        description: `${variant.vehicle.model_name} - ${variant.version} (${variant.color})`,
        quantity: item.quantity,
        unit_price: unitPrice,
        discount_amount: 0,
        line_total: lineTotal,
      });
    }

    const subtotal = processedItems.reduce((sum, i) => sum + i.line_total, 0);
    const taxRate = 10;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    const quotationNumber = `Q-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )
      .toString()
      .padStart(3, "0")}`;

    const quotation = await this.quotationRepo.create({
      quotation_number: quotationNumber,
      customer: { customer_id: input.customerId } as Customer,
      dealer: { dealer_id: dealerId } as Dealer,
      user: { user_id: userId } as User,
      items: processedItems as QuotationItem[],
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      discount_total: 0,
      total_amount: totalAmount,
      notes: input.notes,
      status: QuotationStatus.DRAFT,
    });

    return quotation;
  }

  public async getAllByDealer(dealerId: number): Promise<Quotation[]> {
    return await this.quotationRepo.findAllByDealer(dealerId);
  }

  public async getById(id: number): Promise<Quotation> {
    const quotation = await this.quotationRepo.findById(id);
    if (!quotation) {
      throw new AppError("Quotation not found", 404);
    }
    return quotation;
  }

  public async update(
    id: number,
    updateData: Partial<Quotation>
  ): Promise<Quotation> {
    const quotation = await this.getById(id);

    if (quotation.status !== "DRAFT") {
      throw new AppError(
        "Cannot update a quotation that is not in DRAFT status",
        400
      );
    }

    updateData.updated_at = new Date();
    const updatedQuotation = await this.quotationRepo.updateById(
      id,
      updateData
    );
    if (!updatedQuotation) {
      throw new AppError("Update failed", 400);
    }

    return updatedQuotation;
  }

  public async delete(id: number): Promise<void> {
    const quotation = await this.getById(id);

    if (quotation.status !== "DRAFT") {
      throw new AppError(
        "Cannot delete a quotation that is not in DRAFT status",
        400
      );
    }

    const deleted = await this.quotationRepo.deleteById(id);
    if (!deleted) {
      throw new AppError("Failed to delete quotation", 400);
    }
  }
}

export default new QuotationService();
