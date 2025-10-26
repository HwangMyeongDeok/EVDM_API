import { AppDataSource } from "../../config/data-source";
import { Customer } from "./customer.model";
import { Like } from "typeorm";

export class CustomerRepository {
  private repo = AppDataSource.getRepository(Customer);

  async findById(id: number): Promise<Customer | null> {
    return this.repo.findOne({
      where: { customer_id: id },
      relations: ["dealer", "attachments"],
    });
  }

  async findByPhone(phone: string): Promise<Customer | null> {
    return this.repo.findOne({
      where: { phone },
      relations: ["dealer"],
    });
  }

  async create(data: Partial<Customer>): Promise<Customer> {
    const customer = this.repo.create(data);
    return await this.repo.save(customer);
  }

  async searchByDealer(dealerId: number, query: string): Promise<Customer[]> {
    return this.repo.find({
      where: [
        { dealer_id: dealerId, phone: Like(`%${query}%`) },
        { dealer_id: dealerId, full_name: Like(`%${query}%`) },
      ],
      select: ["customer_id", "full_name", "phone", "email"],
      take: 10,
      order: { full_name: "ASC" },
    });
  }
}

export default new CustomerRepository();