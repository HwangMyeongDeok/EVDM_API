import { PaymentModel } from './payment.model';
import { IPayment } from './payment.interface';

class PaymentRepository {
  public async create(paymentData: Partial<IPayment>): Promise<IPayment> {
    const payment = new PaymentModel(paymentData);
    return payment.save();
  }

  public async findByContractId(contractId: string): Promise<IPayment[]> {
    return PaymentModel.find({ contract: contractId }).sort({ paymentDate: -1 });
  }
}

export default new PaymentRepository();