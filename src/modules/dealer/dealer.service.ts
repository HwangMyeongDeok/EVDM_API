import { AppError } from "../../common/middlewares/AppError";
import DealerRepository from "./dealer.repository";
import { Dealer } from "./dealer.model";

export class DealerService {
  private repo = DealerRepository;

  async getAll(): Promise<Dealer[]> {
    return this.repo.findAll();
  }

  async getById(id: number): Promise<Dealer> {
    const dealer = await this.repo.findById(id);
    if (!dealer) throw new AppError("Dealer not found", 404);
    return dealer;
  }

  async create(data: Partial<Dealer>): Promise<Dealer> {
    if (!data.dealer_name) throw new AppError("Dealer name is required", 400);

    const dealer = new Dealer();
    dealer.dealer_name = data.dealer_name;
    dealer.address = data.address || "";
    dealer.phone = data.phone || "";
    dealer.email = data.email || "";

    return this.repo.create(dealer);
  }

  async update(id: number, data: Partial<Dealer>): Promise<Dealer> {
    const dealer = await this.repo.findById(id);
    if (!dealer) throw new AppError("Dealer not found", 404);

    return this.repo.update(id, data);
  }

  // Xóa đại lý
  async delete(id: number): Promise<void> {
    const dealer = await this.repo.findById(id);
    if (!dealer) throw new AppError("Dealer not found", 404);

    await this.repo.delete(id);
  }
}

export default new DealerService();
