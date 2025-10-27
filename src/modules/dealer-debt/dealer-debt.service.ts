import { AppError } from "../../common/middlewares/AppError";
import DealerDebtRepository from "./dealer-debt.repository";
import { DealerDebt, DealerDebtStatus } from "./dealer-debt.model";
import { AppDataSource } from "../../config/data-source";
import { Dealer } from "../dealer/dealer.model";

export class DealerDebtService {
  private repo = DealerDebtRepository;

  // Lấy tất cả công nợ
  async getAll(): Promise<DealerDebt[]> {
    return this.repo.findAll();
  }

  // Lấy công nợ theo đại lý
  async getByDealer(dealerId: number): Promise<DealerDebt[]> {
    return this.repo.findByDealer(dealerId);
  }

  // Lấy chi tiết công nợ theo ID
  async getById(id: number): Promise<DealerDebt> {
    const debt = await this.repo.findById(id);
    if (!debt) throw new AppError("Dealer debt not found", 404);
    return debt;
  }

  // Tạo công nợ mới
  async create(dealerId: number, amount: number, dueDate?: Date): Promise<DealerDebt> {
    const dealerRepo = AppDataSource.getRepository(Dealer);
    const dealer = await dealerRepo.findOne({ where: { dealer_id: dealerId } });
    if (!dealer) throw new AppError("Dealer not found", 404);

    const debt = new DealerDebt();
    debt.dealer_id = dealerId;
    debt.amount = amount;
    debt.due_date = dueDate || null;
    debt.status = DealerDebtStatus.PENDING;

    return this.repo.save(debt);
  }

  // Cập nhật trạng thái công nợ
  async updateStatus(id: number, status: DealerDebtStatus): Promise<DealerDebt> {
    const debt = await this.repo.findById(id);
    if (!debt) throw new AppError("Dealer debt not found", 404);

    debt.status = status;
    return this.repo.save(debt);
  }

  // Xóa công nợ
  async delete(id: number): Promise<void> {
    const debt = await this.repo.findById(id);
    if (!debt) throw new AppError("Dealer debt not found", 404);
    await this.repo.delete(id);
  }

  // Kiểm tra và tự động cập nhật công nợ quá hạn
  async markOverdue(): Promise<void> {
    const allDebts = await this.repo.findAll();
    const now = new Date();

    for (const debt of allDebts) {
      if (
        debt.due_date &&
        debt.due_date < now &&
        debt.status === DealerDebtStatus.PENDING
      ) {
        debt.status = DealerDebtStatus.OVERDUE;
        await this.repo.save(debt);
      }
    }
  }
}

export default new DealerDebtService();
