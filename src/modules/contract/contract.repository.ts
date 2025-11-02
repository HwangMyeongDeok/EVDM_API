import { AppDataSource } from "../../config/data-source";
import { Contract } from "./contract.model";
import { In } from "typeorm";

export class ContractRepository {
  private repo = AppDataSource.getRepository(Contract);

  async save(contract: Contract): Promise<Contract> {
    return await this.repo.save(contract);
  }

  async findById(id: number): Promise<Contract | null> {
    return this.repo.findOne({
      where: { contract_id: id },
      relations: [
        "dealer",
        "customer",
        "user",
        "quotation",
      ],
    });
  }

  async findByQuotationId(id: number): Promise<Contract | null> {
    return this.repo.findOne({ where: { quotation_id: id } });
  }

  async findByIds(ids: number[]): Promise<Contract[]> {
    return this.repo.find({
      where: { contract_id: In(ids) },
    });
  }
}

export default new ContractRepository();
