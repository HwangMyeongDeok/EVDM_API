import { CustomerModel } from './customer.model';
import { ICustomer } from './customer.interface';

class CustomerRepository {
  public async create(customerData: Partial<ICustomer>): Promise<ICustomer> {
    const customer = new CustomerModel(customerData);
    return customer.save();
  }

  public async findById(id: string): Promise<ICustomer | null> {
    return CustomerModel.findById(id);
  }

  public async findByPhone(phone: string, dealerId: string): Promise<ICustomer | null> {
    return CustomerModel.findOne({ phone, dealer: dealerId });
  }
}

export default new CustomerRepository();