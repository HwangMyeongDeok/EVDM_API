import { AppDataSource } from "../../config/data-source";
import { Payment, PaymentStatus } from "./payment.model";

export class PaymentRepository {
  private repo = AppDataSource.getRepository(Payment);

  async save(payment: Payment): Promise<Payment> {
    return await this.repo.save(payment);
  }

  async findById(id: number): Promise<Payment | null> {
    return this.repo.findOne({
      where: { payment_id: id },
      relations: ["contract", "customer", "dealer"],
    });
  }

  async findByContractId(contractId: number): Promise<Payment[]> {
    return this.repo.find({
      where: { contract_id: contractId },
      order: { created_at: "DESC" },
    });
  }

  async getTotalPaidByContract(contractId: number): Promise<number> {
    const result = await this.repo
      .createQueryBuilder("payment")
      .select("SUM(payment.amount)", "total")
      .where("payment.contract_id = :contractId", { contractId })
      .andWhere("payment.payment_status = :status", { status: PaymentStatus.COMPLETED })
      .getRawOne();
    return Number(result?.total || 0);
  }

  async updateStatus(id: number, status: PaymentStatus, transactionId?: string): Promise<void> {
    const updates: Partial<Payment> = { payment_status: status, updated_at: new Date() };
    if (transactionId) updates.transaction_id = transactionId;
    await this.repo.update(id, updates);
  }
}

export default new PaymentRepository();