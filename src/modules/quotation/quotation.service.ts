import { AppError } from "../../common/middlewares/AppError";
import { VehicleModel } from "../vehicles/vehicle.model";
import QuotationRepository from "./quotation.repository";
import { IQuotation, CreateQuotationDto } from "./quotation.interface";

export class QuotationService {

  public async create(
    staffId: string,
    dealerId: string,
    input: CreateQuotationDto
  ): Promise<IQuotation> {
    if (!input.items?.length) {
      throw new AppError("Quotation must have at least one item", 400);
    }

    const processedItems = await Promise.all(
      input.items.map(async (item) => {
        const vehicleWithVariant = await VehicleModel.findOne(
          { "variants._id": item.variantId },
          { "variants.$": 1, modelName: 1 }
        );

        if (!vehicleWithVariant || vehicleWithVariant.variants.length === 0) {
          throw new AppError(`No variant found with id ${item.variantId}`, 404);
        }

        const variant = vehicleWithVariant.variants[0];
        const unitPrice = variant.retailPrice;

        if (typeof unitPrice !== "number" || unitPrice <= 0) {
          throw new AppError(
            `Invalid price for variant ${item.variantId}`,
            400
          );
        }

        const lineTotal = item.quantity * unitPrice;

        return {
          variantId: item.variantId,
          description: `${vehicleWithVariant.modelName} - ${variant.version} (${variant.color})`,
          quantity: item.quantity,
          unitPrice,
          discountAmount: 0,
          lineTotal,
        };
      })
    );

    const subtotal = processedItems.reduce((sum, i) => sum + i.lineTotal, 0);
    const taxRate = 10;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    const quotationNumber = `Q-${Date.now()}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;

    const quotation = await QuotationRepository.create({
      quotationNumber,
      customer: input.customerId,
      dealer: dealerId,
      staff: staffId,
      items: processedItems,
      subtotal,
      taxRate,
      taxAmount,
      discountTotal: 0,
      totalAmount,
      notes: input.notes,
      status: "DRAFT",
    });

    return quotation;
  }

  public async getAllByDealer(dealerId: string): Promise<IQuotation[]> {
    return await QuotationRepository.findAllByDealer(dealerId);
  }

  public async getById(id: string): Promise<IQuotation> {
    const quotation = await QuotationRepository.findById(id);
    if (!quotation) {
      throw new AppError("Quotation not found", 404);
    }
    return quotation;
  }

  public async update(
    id: string,
    updateData: Partial<IQuotation>
  ): Promise<IQuotation> {
    const quotation = await this.getById(id);

    if (quotation.status !== "DRAFT") {
      throw new AppError(
        "Cannot update a quotation that is not in DRAFT status",
        400
      );
    }

    const updatedQuotation = await QuotationRepository.updateById(
      id,
      updateData
    );

    if (!updatedQuotation) {
      throw new AppError("Failed to update quotation", 500);
    }

    return updatedQuotation;
  }

  public async delete(id: string): Promise<void> {
    const quotation = await this.getById(id);

    if (quotation.status !== "DRAFT") {
      throw new AppError(
        "Cannot delete a quotation that is not in DRAFT status",
        400
      );
    }

    await QuotationRepository.deleteById(id);
  }
}

export default new QuotationService();
