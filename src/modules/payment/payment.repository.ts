import { AppDataSource } from "../../config/data-source";
import { Payment, PaymentStatus } from "./payment.model";

class PaymentRepository {
  private repo = AppDataSource.getRepository(Payment);

  create(data: Partial<Payment>) {
    return this.repo.create(data);
  }

  async save(payment: Payment): Promise<Payment> {
    return await this.repo.save(payment);
  }

  async findById(paymentId: number): Promise<Payment | null> {
    return this.repo.findOne({
      where: { payment_id: paymentId },
      relations: ["dealer", "customer", "contract", "request"],
    });
  }

  async updateStatus(paymentId: number, status: PaymentStatus, transactionId?: string) {
    await this.repo.update(paymentId, {
      payment_status: status,
      transaction_id: transactionId,
      updated_at: new Date(),
    });
  }
}

export default new PaymentRepository();
