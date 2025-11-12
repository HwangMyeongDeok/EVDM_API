import crypto from "crypto";
import moment from "moment-timezone";
import {
  PaymentMethod,
  PaymentStatus,
  PaymentContext,
  Payment,
  PaymentType,
} from "./payment.model";
import { AppDataSource } from "../../config/data-source";
import { UserRole } from "../user/user.model";
import { FindOptionsWhere } from "typeorm";
import { Dealer } from "../dealer/dealer.model";

const VNPAY_TMN_CODE = process.env.VNPAY_TMN_CODE!;
const VNPAY_HASH_SECRET = process.env.VNPAY_HASH_SECRET!;
const VNPAY_URL =
  process.env.NODE_ENV === "production"
    ? "https://pay.vnpay.vn/vpcpay.html"
    : "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const VNPAY_RETURN_URL = process.env.VNPAY_RETURN_URL!;

interface PaymentInput {
  contract_id: number;
  amount: number;
  payment_method: PaymentMethod;
  payment_context?: PaymentContext;
  ipAddr: string;
  user: UserInfo;
}
interface UserInfo {
  user_id: number;
  role: UserRole;
  dealer_id?: number | null;
  email: string;
}

interface FindAllOptions {
  user: UserInfo;
  page: number;
  limit: number;
  status?: PaymentStatus;
  contract_id?: number;
}

export class PaymentService {
  static async createDeposit(input: {
    request_id: number;
    amount: number;
    payment_method: PaymentMethod;
    ipAddr: string;
    user: UserInfo;
  }) {
    return await AppDataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Payment);

      const payment = repo.create({
        request_id: input.request_id,
        amount: input.amount,
        payment_method: input.payment_method,
        payment_type: PaymentType.DEPOSIT,
        payment_context: PaymentContext.CUSTOMER,
        payment_status: PaymentStatus.PENDING,
      });
      await repo.save(payment);

      if (input.payment_method === PaymentMethod.CREDIT_CARD) {
        const date = moment().tz("Asia/Ho_Chi_Minh");
        const createDate = date.format("YYYYMMDDHHmmss");
        const expireDate = date.add(15, "minutes").format("YYYYMMDDHHmmss");

        const vnpParams: Record<string, string> = {
          vnp_IpAddr: input.ipAddr,
          vnp_Version: "2.1.0",
          vnp_Command: "pay",
          vnp_TmnCode: VNPAY_TMN_CODE,
          vnp_Amount: (input.amount * 100).toString(),
          vnp_CurrCode: "VND",
          vnp_TxnRef: payment.payment_id.toString(),
          vnp_OrderInfo: `Thanh toan tien coc request ${input.request_id}`,
          vnp_OrderType: "billpayment",
          vnp_Locale: "vn",
          vnp_ReturnUrl:process.env.VNPAY_RETURN_DEPOSIT_URL!,
          vnp_CreateDate: createDate,
          vnp_ExpireDate: expireDate,
        };

        const sortedParams = Object.keys(vnpParams)
          .sort()
          .reduce((result, key) => {
            result[key] = vnpParams[key];
            return result;
          }, {} as { [key: string]: string });

        const signData = new URLSearchParams(sortedParams).toString();

        const secureHash = crypto
          .createHmac("sha512", VNPAY_HASH_SECRET)
          .update(signData)
          .digest("hex");

        const urlParams = new URLSearchParams(vnpParams);
        urlParams.append("vnp_SecureHash", secureHash);

        const paymentUrl = `${VNPAY_URL}?${urlParams.toString()}`;
        return { payment_id: payment.payment_id, paymentUrl };
      }

      return { payment_id: payment.payment_id };
    });
  }

  static async create(input: PaymentInput) {
    return await AppDataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Payment);

      const payment = repo.create({
        contract_id: input.contract_id,
        amount: input.amount,
        payment_method: input.payment_method,
        payment_context: input.payment_context || PaymentContext.CUSTOMER,
        payment_status: PaymentStatus.PENDING,
      });
      await repo.save(payment);

      if (input.payment_method === PaymentMethod.CREDIT_CARD) {
        const date = moment().tz("Asia/Ho_Chi_Minh");
        const createDate = date.format("YYYYMMDDHHmmss");
        const expireDate = date.add(15, "minutes").format("YYYYMMDDHHmmss");

        const vnpParams: Record<string, string> = {
          vnp_Version: "2.1.0",
          vnp_Command: "pay",
          vnp_TmnCode: VNPAY_TMN_CODE,
          vnp_Amount: (input.amount * 100).toString(),
          vnp_CurrCode: "VND",
          vnp_TxnRef: payment.payment_id.toString(),
          vnp_OrderInfo: `Thanh toan hop dong ${input.contract_id}`,
          vnp_OrderType: "billpayment",
          vnp_Locale: "vn",
          vnp_ReturnUrl: VNPAY_RETURN_URL,
          vnp_IpAddr: input.ipAddr,
          vnp_CreateDate: createDate,
          vnp_ExpireDate: expireDate,
        };

        const sortedParams = Object.keys(vnpParams)
          .sort()
          .reduce((result, key) => {
            result[key] = vnpParams[key];
            return result;
          }, {} as { [key: string]: string });

        const signData = new URLSearchParams(sortedParams).toString();

        const secureHash = crypto
          .createHmac("sha512", VNPAY_HASH_SECRET)
          .update(signData)
          .digest("hex");

        const urlParams = new URLSearchParams(vnpParams);
        urlParams.append("vnp_SecureHash", secureHash);

        const paymentUrl = `${VNPAY_URL}?${urlParams.toString()}`;
        return { payment_id: payment.payment_id, paymentUrl };
      }

      return { payment_id: payment.payment_id };
    });
  }

  static async verifyVNPAYReturn(vnpParams: Record<string, string>) {
    return await AppDataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Payment);

      const secureHash = vnpParams["vnp_SecureHash"];
      delete vnpParams["vnp_SecureHash"];
      delete vnpParams["vnp_SecureHashType"];

      const sortedParams = Object.keys(vnpParams)
        .sort()
        .reduce((result, key) => {
          result[key] = vnpParams[key];
          return result;
        }, {} as { [key: string]: string });

      const signData = new URLSearchParams(sortedParams).toString();

      const hashCheck = crypto
        .createHmac("sha512", VNPAY_HASH_SECRET)
        .update(signData)
        .digest("hex");

      const txnRef = Number(vnpParams["vnp_TxnRef"]);
      const responseCode = vnpParams["vnp_ResponseCode"];
      const transactionNo = vnpParams["vnp_TransactionNo"];
      const isValid = secureHash === hashCheck;

      const payment = await repo.findOne({ where: { payment_id: txnRef } });
      if (!payment) throw new Error("Payment not found");
      if (payment.payment_status !== PaymentStatus.PENDING) {
        return {
          txnRef,
          responseCode,
          isValid: false,
          message: "Payment already processed",
        };
      }

      const newStatus =
        isValid && responseCode === "00"
          ? PaymentStatus.COMPLETED
          : PaymentStatus.FAILED;
      await repo.update(txnRef, {
        payment_status: newStatus,
        transaction_id: transactionNo,
        updated_at: new Date(),
      });

      return { txnRef, responseCode, isValid, transactionNo };
    });
  }

  static async findById(paymentId: number, user: UserInfo) {
    const repo = AppDataSource.getRepository(Payment);

    const where: FindOptionsWhere<Payment> = { payment_id: paymentId };

    switch (user.role) {
      case UserRole.ADMIN:
        break;
      case UserRole.DEALER_MANAGER:
        if (user.dealer_id == null) {
          throw new Error("Dealer ID missing for manager");
        }
        where.dealer_id = user.dealer_id;
        break;
      case UserRole.DEALER_STAFF:
        where.contract = { user_id: user.user_id } as any;
        break;
      default:
        throw new Error("Unauthorized role");
    }

    return await repo.findOne({
      where: where,
      relations: ["contract", "customer", "dealer"],
    });
  }

  static async findAll(options: FindAllOptions) {
    const repo = AppDataSource.getRepository(Payment);
    const { user, page, limit, status, contract_id } = options;

    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Payment> = {};
    if (status) {
      where.payment_status = status;
    }
    if (contract_id) {
      where.contract_id = contract_id;
    }

    switch (user.role) {
      case UserRole.ADMIN:
        break;
      case UserRole.DEALER_MANAGER:
        if (user.dealer_id == null) {
          throw new Error("Dealer ID missing for manager");
        }
        where.dealer_id = user.dealer_id;
        break;
      case UserRole.DEALER_STAFF:
        where.contract = { user_id: user.user_id } as any;
        break;
      default:
        throw new Error("Unauthorized role for viewing payments");
    }

    const [data, totalItems] = await repo.findAndCount({
      where,
      relations: ["contract", "customer", "dealer"],
      order: { created_at: "DESC" },
      skip: skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      totalItems,
      totalPages,
      currentPage: page,
    };
  }
}
