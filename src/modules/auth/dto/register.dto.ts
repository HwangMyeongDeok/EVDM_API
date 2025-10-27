export class RegisterDto {
  password?: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
  phone?: string;
  dealer_id?: string;
  role?:  'DEALER_MANAGER' | 'DEALER_STAFF' | 'EVM_STAFF';
}