import { AppError } from "../../common/middlewares/AppError";
import ContractRepository from "./contract.repository";
import {
  Contract,
  ContractStatus,
  PaymentStatus,
  PaymentPlan,
} from "./contract.model";
import QuotationRepository from "../quotation/quotation.repository";
import { CreateFromQuotationDto } from "./dto/create-from-quotation.dto";
import { CreateManualDto } from "./dto/create-manual.dto";
import { UploadAttachmentDto } from "./dto/upload-attachment.dto";
import { MakePaymentDto } from "./dto/make-payment.dto";
import { DeliverContractDto } from "./dto/deliver-contract.dto";
import {
  CustomerAttachment,
  DocumentType,
} from "../customer-attachment/customer-attachment.model";
import {
  VehicleUnit,
  VehicleUnitStatus,
} from "../vehicle-unit/vehicle-unit.model";
import { Payment, PaymentMethod } from "../payment/payment.model";
import { AppDataSource } from "../../config/data-source";

export class ContractService {
  private contractRepo = ContractRepository;
  private quotationRepo = QuotationRepository;

  async getAll(dealerId: number): Promise<Contract[]> {
    return await this.contractRepo.findAllByDealer(dealerId);
  }
  async createFromQuotation(
    quotationId: number,
    dto: CreateFromQuotationDto,
    userId: number,
    dealerId: number
  ): Promise<Contract> {
    const quotation = await this.quotationRepo.findById(quotationId);
    if (!quotation) throw new AppError("Quotation not found", 404);
    if (quotation.dealer_id !== dealerId) throw new AppError("Forbidden", 403);

    const exist = await this.contractRepo.findByQuotationId(quotationId);
    if (exist) throw new AppError("Contract already exists", 400);

    const deposit = dto.payment_plan === "DEPOSIT" ? dto.deposit_amount || 0 : 0;
    const finalAmount = quotation.total_amount! - deposit;

    const contract = new Contract();
    contract.contract_code = this.generateCode();
    contract.quotation_id = quotationId;
    contract.dealer_id = dealerId;
    contract.customer_id = quotation.customer_id;
    contract.user_id = userId;
    contract.contract_date = new Date();
    contract.delivery_date = dto.delivery_date ? new Date(dto.delivery_date) : null;
    contract.total_amount = quotation.total_amount!;
    contract.discount_amount = quotation.discount_total || 0;
    contract.final_amount = finalAmount;
    contract.payment_plan = dto.payment_plan as PaymentPlan;
    contract.deposit_amount = deposit;
    contract.remaining_amount = finalAmount;
    contract.payment_status = PaymentStatus.UNPAID;
    contract.status = ContractStatus.PENDING_APPROVAL;

    return await this.contractRepo.save(contract);
  }

  async createManual(dto: CreateManualDto, userId: number, dealerId: number): Promise<Contract> {
    const deposit = dto.payment_plan === "DEPOSIT" ? dto.deposit_amount || 0 : 0;
    const finalAmount = dto.total_amount - deposit;

    const contract = new Contract();
    contract.contract_code = this.generateCode();
    contract.dealer_id = dealerId;
    contract.customer_id = dto.customer_id;
    contract.user_id = userId;
    contract.contract_date = new Date();
    contract.delivery_date = dto.delivery_date ? new Date(dto.delivery_date) : null;
    contract.total_amount = dto.total_amount;
    contract.discount_amount = 0;
    contract.final_amount = finalAmount;
    contract.payment_plan = dto.payment_plan as PaymentPlan;
    contract.deposit_amount = deposit;
    contract.remaining_amount = finalAmount;
    contract.payment_status = PaymentStatus.UNPAID;
    contract.status = ContractStatus.PENDING_APPROVAL;

    return await this.contractRepo.save(contract);
  }

  async uploadAttachment(contractId: number, dto: UploadAttachmentDto, dealerId: number) {
    const contract = await this.contractRepo.findById(contractId);
    if (!contract || contract.dealer_id !== dealerId)
      throw new AppError("Contract not found", 404);

    const attachment = new CustomerAttachment();
    attachment.customer_id = contract.customer_id;
    attachment.document_type = dto.type as DocumentType;
    attachment.attachment_url = dto.file_url;

    const saved = await AppDataSource.getRepository(CustomerAttachment).save(attachment);
    return { success: true, message: "Attachment uploaded", attachment_id: saved.attachment_id };
  }

  async makePayment(contractId: number, dto: MakePaymentDto, userId: number, dealerId: number) {
    if (dto.amount <= 0) throw new AppError("Amount must be greater than 0", 400);

    const contract = await this.contractRepo.findById(contractId);
    if (!contract || contract.dealer_id !== dealerId)
      throw new AppError("Contract not found", 404);

    const payment = new Payment();
    payment.contract_id = contractId;
    payment.amount = dto.amount;
    payment.payment_method = dto.method as PaymentMethod;
    payment.created_at = new Date();

    await AppDataSource.getRepository(Payment).save(payment);

    const totalPaid = (contract.deposit_amount || 0) + dto.amount;
    contract.payment_status = totalPaid >= contract.final_amount ? PaymentStatus.PAID : PaymentStatus.PARTIAL;
    contract.remaining_amount = contract.final_amount - totalPaid;

    await this.contractRepo.save(contract);

    return { success: true, payment, contract };
  }

  async deliver(contractId: number, dto: DeliverContractDto, dealerId: number) {
    const contract = await this.contractRepo.findById(contractId);
    if (!contract || contract.dealer_id !== dealerId)
      throw new AppError("Contract not found", 404);
    if (contract.payment_status !== PaymentStatus.PAID)
      throw new AppError("Contract not fully paid", 400);

    const unit = await AppDataSource.getRepository(VehicleUnit).findOne({
      where: { vin: dto.vin, status: VehicleUnitStatus.IN_DEALER },
    });
    if (!unit) throw new AppError("Vehicle not in stock", 400);

    unit.status = VehicleUnitStatus.SOLD;
    unit.license_plate = dto.license_plate || "";
    await AppDataSource.getRepository(VehicleUnit).save(unit);

    contract.status = ContractStatus.COMPLETED;
    contract.delivery_date = new Date();
    await this.contractRepo.save(contract);

    return { success: true, message: "Delivery completed", contract };
  }

  async approve(contractId: number, managerId: number, dealerId: number) {
    const contract = await this.contractRepo.findById(contractId);
    if (!contract || contract.dealer_id !== dealerId)
      throw new AppError("Contract not found", 404);
    if (contract.status !== ContractStatus.PENDING_APPROVAL)
      throw new AppError("Invalid status", 400);

    contract.status = ContractStatus.PENDING_SIGN;
    contract.approved_by = managerId;
    return await this.contractRepo.save(contract);
  }

  async getById(id: number): Promise<Contract> {
    const contract = await this.contractRepo.findById(id);
    if (!contract) throw new AppError("Contract not found", 404);
    return contract;
  }

  private generateCode(): string {
    return `CT-${Date.now()}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;
  }
}

export default new ContractService();
