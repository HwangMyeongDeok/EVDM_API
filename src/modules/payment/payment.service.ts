import { AppError } from '../../common/middlewares/AppError';
import PaymentRepository from './payment.repository';
import ContractRepository from '../contract/contract.repository';
import { IPayment } from './payment.interface';

interface CreatePaymentInput {
  contractId: string;
  amount: number;
  paymentMethod: 'BANK_TRANSFER' | 'CASH' | 'CREDIT_CARD';
  paymentType: 'DEPOSIT' | 'FINAL'; 
}

class PaymentService {
  public async createPayment(input: CreatePaymentInput, staff: { id: string; dealerId: string; }): Promise<IPayment> {
    const contract = await ContractRepository.findById(input.contractId);
    if (!contract) {
      throw new AppError('no contract found', 404);
    }

    if (input.amount > contract.remainingAmount) {
      throw new AppError(`the amount (${input.amount}) greater than remaining amount (${contract.remainingAmount})`, 400);
    }
    
    const newPayment = await PaymentRepository.create({
      dealer: staff.dealerId,
      customer: contract.customer,
      contract: input.contractId,
      amount: input.amount,
      paymentMethod: input.paymentMethod,
      paymentType: 'INSTALLMENT',
      paymentStatus: 'COMPLETED',
      paymentContext: 'CUSTOMER',
      paymentDate: new Date(),
    });

    contract.remainingAmount -= input.amount;
    contract.depositAmount += input.amount;

    if (contract.remainingAmount <= 0) {
      contract.paymentStatus = 'PAID';
    } else {
      contract.paymentStatus = 'PARTIAL';
    }

    await ContractRepository.updateById(contract._id.toString(), {
        remainingAmount: contract.remainingAmount,
        depositAmount: contract.depositAmount,
        paymentStatus: contract.paymentStatus,
    });
    
    return newPayment;
  }
}

export default new PaymentService();