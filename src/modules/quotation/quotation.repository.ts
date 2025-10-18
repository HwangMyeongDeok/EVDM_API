import { IQuotation } from './quotation.interface';
import { QuotationModel } from './quotation.model';

class QuotationRepository {

  public async create(data: Partial<IQuotation>): Promise<IQuotation> {
    const quotation = new QuotationModel(data);
    return quotation.save();
  }

  public async findById(id: string): Promise<IQuotation | null> {
    return QuotationModel.findById(id)
      .populate('customer', 'fullName phone')
      .populate('staff', 'fullName');
  }

  public async findAllByDealer(dealerId: string): Promise<IQuotation[]> {
    return QuotationModel.find({ dealer: dealerId }).sort({ createdAt: -1 });
  }

  public async updateById(id: string, updateData: Partial<IQuotation>): Promise<IQuotation | null> {
    return QuotationModel.findByIdAndUpdate(id, updateData, { new: true }); 
  }

  public async deleteById(id: string): Promise<any> {
    return QuotationModel.deleteOne({ _id: id });
  }
}

export default new QuotationRepository();