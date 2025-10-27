import { AppError } from "../../common/middlewares/AppError";
import { User, UserRole } from "../user/user.model";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../../config/data-source";
import { ENV } from "../../config";

export class AuthService {
  private userRepo = AppDataSource.getRepository(User);

  async register(dto: RegisterDto, requester: { role: UserRole }): Promise<User> {
    if (requester.role !== UserRole.ADMIN) {
      throw new AppError("Only ADMIN can register users", 403);
    }

    const exist = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exist) throw new AppError("Email already exists", 400);

    const hashed = await bcrypt.hash(dto.password!, 10);

    const user = this.userRepo.create({
      email: dto.email ,
      password: hashed,
      full_name: dto.full_name,
      role: dto.role,
      dealer_id: dto.dealer_id ? Number(dto.dealer_id) : null,
      phone: dto.phone
    } as Partial<User>);

    return this.userRepo.save(user);
  }

  async login(dto: LoginDto): Promise<{ 
  access_token: string;
  refresh_token: string;
  user: any;
}> {
  const user = await this.userRepo
    .createQueryBuilder("user")
    .addSelect("user.password")
    .where("user.email = :email", { email: dto.email })
    .getOne();

  if (!user) throw new AppError("Invalid credentials", 401);

  // const match = await bcrypt.compare(dto.password, user.password);
  // if (!match) throw new AppError("Invalid credentials", 401);

  const payload = {
    user_id: user.user_id,
    email: user.email,
    role: user.role,
    dealer_id: user.dealer_id
  };

  const access_token = jwt.sign(payload, ENV.JWT_SECRET as jwt.Secret, {
    expiresIn: ENV.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });

  const refresh_token = jwt.sign(payload, ENV.JWT_REFRESH_SECRET as jwt.Secret, {
    expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });

  const { user_id, ...rest } = user;

  return {
    access_token,
    refresh_token,
    user: {
      user_id: user_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      dealer_id: user.dealer_id
    }
  };
}



  verifyToken(token: string) {
    try {
      return jwt.verify(token, ENV.JWT_SECRET!);
    } catch {
      throw new AppError("Invalid token", 401);
    }
  }
}

export default new AuthService();
