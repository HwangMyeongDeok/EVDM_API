import { AppError } from "../../common/middlewares/AppError";
import PaymentRepository from "./payment.repository";
import {
  Payment,
  PaymentStatus,
} from "./payment.model";
import ContractRepository from "../contract/contract.repository";
import { PaymentStatus as ContractPaymentStatus } from "../contract/contract.model";
import { PaymentMethod, PaymentType } from "./payment.model"; 
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { VNPay, ProductCode, VnpLocale } from "vnpay";

const vnpay = new VNPay({
  tmnCode: process.env.VNPAY_TMNCODE || "KGMS82FM",
  secureSecret:
    process.env.VNPAY_HASHSECRET || "8ZHCOE749V9Y9PLNW5X8H9M4UAIM7OEB",
  vnpayHost: process.env.VNPAY_HOST || "https://sandbox.vnpayment.vn",
  testMode: true,
  enableLog: true,
});

export class PaymentService {
  private repo = PaymentRepository;
  private contractRepo = ContractRepository;

  async create(
    dto: CreatePaymentDto,
    userId: number,
    dealerId: number,
    ipAddr: string
  ): Promise<{ payment: Payment; paymentUrl?: string }> {
    if (!dto.contract_id && !dto.customer_id) {
      throw new AppError("contract_id or customer_id is required", 400);
    }

    let amount = dto.amount;
    let orderType = ProductCode.Other;

    if (dto.payment_type === PaymentType.DEPOSIT) {
      const total =
        dto.total_amount ||
        (dto.contract_id
          ? (await this.contractRepo.findById(dto.contract_id))?.final_amount ||
            0
          : 0);
      if (total <= 0)
        throw new AppError("Valid total amount required for deposit", 400);
      amount = total * 0.3; 
    } else if (dto.payment_type === PaymentType.INSTALLMENT) {
      orderType = ProductCode.Phone_Tablet;
    } else if (dto.payment_type && dto.payment_type !== PaymentType.FULL) {
      throw new AppError("Invalid payment type", 400);
    }

    const payment = new Payment();
    payment.amount = amount;
    payment.payment_method = dto.payment_method;
    payment.payment_type = dto.payment_type!;
    payment.transaction_id = dto.transaction_id!; 
    payment.payment_context = dto.payment_context;
    payment.payment_date = new Date();
    payment.payment_status =
      dto.payment_method === PaymentMethod.CASH
        ? PaymentStatus.COMPLETED
        : PaymentStatus.PENDING;

    if (dto.contract_id) {
      const contract = await this.contractRepo.findById(dto.contract_id);
      if (!contract || contract.dealer_id !== dealerId) {
        throw new AppError("Contract not found or unauthorized", 404);
      }
      payment.contract_id = dto.contract_id;
      payment.contract = contract;
      payment.customer_id = contract.customer_id;
      payment.dealer_id = dealerId;

      if (payment.payment_status === PaymentStatus.COMPLETED) {
        await this.updateContractAfterPayment(dto.contract_id, amount);
      }
    } else {
      payment.customer_id = dto.customer_id!;
    }

    const savedPayment = await this.repo.save(payment);

    if (dto.payment_method === PaymentMethod.CASH) {
      return { payment: savedPayment };
    }

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: ipAddr,
      vnp_TxnRef: `${savedPayment.payment_id}`,
      vnp_OrderInfo: `Thanh toan don hang ${savedPayment.payment_id}`,
      vnp_OrderType: orderType,
      vnp_ReturnUrl:
        process.env.VNPAY_RETURN_URL ||
        "https://evdm-client.vercel.app/payment-success",
      vnp_Locale: VnpLocale.VN,
    });

    return { payment: savedPayment, paymentUrl };
  }

  private async updateContractAfterPayment(
    contractId: number,
    addedAmount: number
  ): Promise<void> {
    const contract = await this.contractRepo.findById(contractId);
    if (!contract) return;

    const totalPaid = await this.repo.getTotalPaidByContract(contractId);
    const newTotal = totalPaid + addedAmount;

    if (newTotal >= contract.final_amount) {
      contract.payment_status = ContractPaymentStatus.PAID;
    } else if (newTotal > 0) {
      contract.payment_status = ContractPaymentStatus.PARTIAL;
    }
    contract.remaining_amount = contract.final_amount - newTotal;
    await this.contractRepo.save(contract);
  }

  async getByContractId(contractId: number): Promise<Payment[]> {
    return this.repo.findByContractId(contractId);
  }

  async getById(id: number): Promise<Payment> {
    const payment = await this.repo.findById(id);
    if (!payment) throw new AppError("Payment not found", 404);
    return payment;
  }

  async updateFromIpn(
    txnRef: string,
    amount: number | string,
    transactionNo: string | number,
    isSuccess: boolean
  ): Promise<void> {
    const paymentId = Number(txnRef);
    const payment = await this.getById(paymentId);

    const vnpAmount = Number(amount); 
    if (payment.amount !== vnpAmount) throw new AppError("Invalid amount", 400);
    if (payment.payment_status !== PaymentStatus.PENDING) return;

    const newStatus = isSuccess
      ? PaymentStatus.COMPLETED
      : PaymentStatus.FAILED;
    await this.repo.updateStatus(paymentId, newStatus, transactionNo.toString());

    if (isSuccess && payment.contract_id) {
      await this.updateContractAfterPayment(
        payment.contract_id,
        payment.amount
      );
    }
  }
}

export default new PaymentService();