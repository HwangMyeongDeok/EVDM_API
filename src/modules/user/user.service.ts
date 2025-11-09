import { AppError } from "../../common/middlewares/AppError";
import UserRepository from "./user.repository";
import { User, UserRole } from "./user.model";
import bcrypt from "bcrypt";
import { th } from "zod/v4/locales";

export class UserService {
  private repo = UserRepository;

  async getAll(): Promise<User[]> {
    return this.repo.findAll();
  }

  async getById(id: number): Promise<User> {
    const user = await this.repo.findById(id);
    if (!user) throw new AppError("User not found", 404);
    return user;
  }

  async create(data: Partial<User>): Promise<User> {
    if (!data.email || !data.password) throw new AppError("Email and password are required", 400);

    if(!data.dealer_id || data.dealer_id === null) throw new AppError("Dealer ID is required", 400);

    const user = new User();
    user.email = data.email;
    user.password = await bcrypt.hash(data.password, 10);
    user.full_name = data.full_name || "";
    user.phone = data.phone || "";
    user.role = data.role || UserRole.DEALER_STAFF;
    user.dealer_id = data.dealer_id;

    return this.repo.create(user);
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.repo.update(id, data);
  }

  async delete(id: number): Promise<void> {
    const user = await this.repo.findById(id);
    if (!user) throw new AppError("User not found", 404);
    await this.repo.delete(id);
  }
}

export default new UserService();
