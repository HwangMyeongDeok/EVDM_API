import { AppError } from '../../common/middlewares/AppError';
import CustomerRepository from './customer.repository';
import { ICustomer } from './customer.interface';

class CustomerService {
  public async createCustomer(customerData: Partial<ICustomer>): Promise<ICustomer> {
    const existingCustomer = await CustomerRepository.findByPhone(customerData.phone!, customerData.dealer!.toString());

    if (existingCustomer) {
      throw new AppError('customer already exists', 409);
    }

    return CustomerRepository.create(customerData);
  }

  public async getCustomerById(id: string): Promise<ICustomer> {
    const customer = await CustomerRepository.findById(id);
    if (!customer) {
      throw new AppError('customer not found', 404);
    }
    return customer;
  }
}

export default new CustomerService();