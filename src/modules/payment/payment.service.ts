import { AppError } from "../../common/middlewares/AppError";
import PaymentRepository from "./payment.repository";
import { Payment, PaymentStatus, PaymentMethod, PaymentType, PaymentContext } from "./payment.model";
import ContractRepository from "../contract/contract.repository";
import {  PaymentStatus as ContractPaymentStatus } from "../contract/contract.model";
import { CreatePaymentDto } from "./dto/create-payment.dto";

export class PaymentService {
  private repo = PaymentRepository;
  private contractRepo = ContractRepository;

  async create(dto: CreatePaymentDto, userId: number, dealerId: number): Promise<Payment> {
    if (!dto.contract_id && !dto.customer_id) {
      throw new AppError("contract_id or customer_id is required", 400);
    }

    const payment = new Payment();
    payment.amount = dto.amount;
    payment.payment_method = dto.payment_method as PaymentMethod;
    payment.payment_type = (dto.payment_type as PaymentType) || null;
    payment.transaction_id = dto.transaction_id || "";
    payment.payment_status = PaymentStatus.COMPLETED;
    payment.payment_context = PaymentContext.CUSTOMER;
    payment.payment_date = new Date();

    if (dto.contract_id) {
      const contract = await this.contractRepo.findById(dto.contract_id);
      if (!contract || contract.dealer_id !== dealerId) {
        throw new AppError("Contract not found or unauthorized", 404);
      }
      payment.contract_id = dto.contract_id;
      payment.customer_id = contract.customer_id;

      const totalPaid = await this.repo.getTotalPaidByContract(dto.contract_id);
      const newTotal = totalPaid + dto.amount;

      if (newTotal >= contract.final_amount) {
        contract.payment_status = ContractPaymentStatus.PAID;
      } else if (newTotal > 0) {
        contract.payment_status = ContractPaymentStatus.PARTIAL;
      }
      contract.remaining_amount = contract.final_amount - newTotal;
      await this.contractRepo.save(contract);
    }

    if (dto.customer_id && !dto.contract_id) {
      payment.customer_id = dto.customer_id;
      payment.payment_context = PaymentContext.CUSTOMER;
    }

    return await this.repo.save(payment);
  }

  async getByContractId(contractId: number): Promise<Payment[]> {
    return this.repo.findByContractId(contractId);
  }

  async getById(id: number): Promise<Payment> {
    const payment = await this.repo.findById(id);
    if (!payment) throw new AppError("Payment not found", 404);
    return payment;
  }
}

export default new PaymentService();