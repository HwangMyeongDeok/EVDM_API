import { AppError } from "../../common/middlewares/AppError";
import ContractRepository from "./contract.repository";
import QuotationRepository from "../quotation/quotation.repository";
import { IContract } from "./contract.interface";
import { VehicleModel } from "../vehicles/vehicle.model";

class ContractService {
  public async createContract(
    quotationId: string,
    staffId: string
  ): Promise<IContract> {
    const existingContract = await ContractRepository.findByQuotationId(
      quotationId
    );
    if (existingContract) {
      throw new AppError("contract already exists", 409);
    }

    const quotation = await QuotationRepository.findById(quotationId);
    if (!quotation) {
      throw new AppError("no quotation found", 404);
    }

    if (quotation.status !== "APPROVED") {
      throw new AppError("quotation is not approved", 400);
    }

    const contractNumber = `HD-${quotation.quotationNumber}`;
    const remainingAmount = quotation.totalAmount;

    const newContractData: Partial<IContract> = {
      contractNumber,
      quotation: quotation._id,
      dealer: quotation.dealer,
      customer: quotation.customer,
      staff: staffId,
      contractDate: new Date(),
      status: "PENDING_APPROVAL",
      totalAmount: quotation.totalAmount,
      discountAmount: quotation.discountTotal,
      finalAmount: quotation.totalAmount - quotation.discountTotal,
      paymentStatus: "UNPAID",
      paymentPlan: "DEPOSIT",
      remainingAmount,
      items: quotation.items.map((item) => ({ ...(item as any).toObject() })),
    };

    return ContractRepository.create(newContractData);
  }

  public async approveContract(
    contractId: string,
    managerId: string
  ): Promise<IContract> {
    const contract = await ContractRepository.findById(contractId);
    if (!contract) {
      throw new AppError("no contract found", 404);
    }

    if (contract.status !== "PENDING_APPROVAL") {
      throw new AppError("contract is not pending approval", 400);
    }

    const updatedData: Partial<IContract> = {
      status: "SIGNED",
      approvedBy: managerId,
    };

    const updated = await ContractRepository.updateById(
      contractId,
      updatedData
    );
    if (!updated) {
      throw new AppError("failed to update contract", 500);
    }
    return updated;
  }

  public async handoverVehicle(
    contractId: string,
    vin: string
  ): Promise<IContract> {
    const contract = await ContractRepository.findById(contractId);
    if (!contract) {
      throw new AppError("no contract found", 404);
    }

    if (contract.status !== "SIGNED") {
      throw new AppError("contract is not signed", 400);
    }
    if (contract.paymentStatus !== "PAID") {
      throw new AppError("contract is not paid", 400);
    }

    const updateResult = await VehicleModel.updateOne(
      { "variants.units.vin": vin },
      { $set: { "variants.$[].units.$[unit].status": "SOLD" } },
      { arrayFilters: [{ "unit.vin": vin }] }
    );

    if (updateResult.modifiedCount === 0) {
      throw new AppError(`Vehicle with VIN ${vin} not found`, 404);
    }

    contract.status = "COMPLETED";
    contract.deliveryDate = new Date();

    const updated = await ContractRepository.updateById(contractId, {
      status: "COMPLETED",
      deliveryDate: new Date(),
    });

    if (!updated) {
      throw new AppError("failed to update contract status", 500);
    }

    return updated;
  }
}

export default new ContractService();
