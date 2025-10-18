import { IContract } from './contract.interface';
import { ContractModel } from './contract.model';

class ContractRepository {
  public async create(data: Partial<IContract>): Promise<IContract> {
    const contract = new ContractModel(data);
    return contract.save();
  }

  public async findById(id: string): Promise<IContract | null> {
    return ContractModel.findById(id).populate('customer staff');
  }

  public async findByQuotationId(quotationId: string): Promise<IContract | null> {
    return ContractModel.findOne({ quotation: quotationId });
  }

  public async updateById(id: string, updateData: Partial<IContract>): Promise<IContract | null> {
    return ContractModel.findByIdAndUpdate(id, updateData, { new: true });
  }
}

export default new ContractRepository();