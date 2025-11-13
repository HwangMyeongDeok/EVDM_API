import { AppDataSource } from "../../config/data-source";
import { User } from "./user.model";

export class UserRepository {
  private repo = AppDataSource.getRepository(User);

  async findAll(): Promise<User[]> {
    return this.repo.find({ relations: ["dealer"], order: { created_at: "DESC" } });
  }

  async findById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { user_id: id }, relations: ["dealer"] });
  }

  async create(user: User): Promise<User> {
    return this.repo.save(user);
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    await this.repo.update(id, data);
    const updated = await this.findById(id);
    if (!updated) throw new Error("Update failed: User not found");
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}

export default new UserRepository();
