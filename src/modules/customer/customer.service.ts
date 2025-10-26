import { AppError } from "../../common/middlewares/AppError";
import CustomerRepository from "./customer.repository";
import { Customer } from "./customer.model";

export class CustomerService {
  private repo = CustomerRepository;

  async searchByDealer(dealerId: number, query: string): Promise<Partial<Customer>[]> {
    if (!query || query.trim().length < 2) return [];
    return this.repo.searchByDealer(dealerId, query.trim());
  }

  async createCustomer(input: {
    full_name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    dealer_id: number;
  }): Promise<Customer> {
    const { full_name, phone, email, address, dealer_id } = input;

    if (!full_name?.trim()) {
      throw new AppError("full_name is required", 400);
    }

    if (phone) {
      const exist = await this.repo.findByPhone(phone);
      if (exist && exist.dealer_id === dealer_id) {
        throw new AppError("Phone already exists for this dealer", 400);
      }
    }

    return this.repo.create({
      full_name: full_name.trim(),
      phone: phone ?? undefined,
      email: email ?? undefined,
      address: address ?? undefined,
      dealer_id,
    });
  }

  async getById(id: number): Promise<Customer> {
    const customer = await this.repo.findById(id);
    if (!customer) throw new AppError("Customer not found", 404);
    return customer;
  }
}

export default new CustomerService();