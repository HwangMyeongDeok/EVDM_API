import { Request, Response, NextFunction } from "express";
import PaymentService from "./payment.service";
import {  PaymentMethod, PaymentType, PaymentContext } from "./payment.model";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { AppError } from "../../common/middlewares/AppError";
import { VNPay, VerifyReturnUrl, VerifyIpnCall } from 'vnpay';

const vnpay = new VNPay({
  tmnCode: process.env.VNPAY_TMNCODE || 'KGMS82FM',
  secureSecret: process.env.VNPAY_HASHSECRET || '8ZHCOE749V9Y9PLNW5X8H9M4UAIM7OEB',
  vnpayHost: process.env.VNPAY_HOST || 'https://sandbox.vnpayment.vn',
  testMode: true,
  enableLog: true,
});

class PaymentController {
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: CreatePaymentDto = req.body;

      if (typeof dto.amount !== 'number' || dto.amount <= 0) {
        throw new AppError("Amount must be a positive number", 400);
      }
      if (!dto.payment_method || ![PaymentMethod.BANK_TRANSFER, PaymentMethod.CASH, PaymentMethod.CREDIT_CARD].includes(dto.payment_method)) {
        throw new AppError("Invalid payment_method", 400);
      }
      if (!dto.payment_context || ![PaymentContext.CUSTOMER, PaymentContext.DEALER].includes(dto.payment_context)) {
        throw new AppError("Invalid payment_context", 400);
      }
      if (!dto.contract_id && !dto.customer_id) {
        throw new AppError("contract_id or customer_id is required", 400);
      }
      if (dto.payment_type && ![PaymentType.FULL, PaymentType.INSTALLMENT, PaymentType.DEPOSIT].includes(dto.payment_type)) {
        throw new AppError("Invalid payment_type", 400);
      }
      if (typeof dto.contract_id === 'string') dto.contract_id = Number(dto.contract_id);
      if (typeof dto.customer_id === 'string') dto.customer_id = Number(dto.customer_id);
      if (typeof dto.total_amount === 'string') dto.total_amount = Number(dto.total_amount);

      const userId = Number(req.user!.user_id);
      const dealerId = Number(req.user?.dealer_id);
      if (isNaN(userId) || isNaN(dealerId)) throw new AppError("Unauthorized", 401);

      const ipAddr = req.ip || '127.0.0.1';
      const result = await PaymentService.create(dto, userId, dealerId, ipAddr);

      if (result.paymentUrl) {
        return res.redirect(result.paymentUrl);
      }
      res.status(201).json({ success: true, data: result.payment });
    } catch (error) {
      next(error);
    }
  }

  public async getByContract(req: Request, res: Response, next: NextFunction) {
    try {
      const contractId = Number(req.params.contractId);
      if (isNaN(contractId)) throw new AppError("Invalid contractId", 400);
      const payments = await PaymentService.getByContractId(contractId);
      res.json({ success: true, count: payments.length, data: payments });
    } catch (error) {
      next(error);
    }
  }

  public async vnpayReturn(req: Request, res: Response) {
    const verify: VerifyReturnUrl = vnpay.verifyReturnUrl(req.query as any);

    if (!verify.isVerified || !verify.isSuccess) {
      return res.status(400).json({ success: false, message: 'Thanh toán thất bại hoặc dữ liệu không hợp lệ' });
    }

    res.json({ success: true, message: 'Thanh toán thành công! Đơn hàng đang được xử lý.' });
  }

  public async vnpayIpn(req: Request, res: Response) {
    const verify: VerifyIpnCall = vnpay.verifyIpnCall(req.query as any);

    if (!verify.isVerified) {
      return res.json({ RspCode: '97', Message: 'Fail Checksum' });
    }

    try {
      await PaymentService.updateFromIpn(
        verify.vnp_TxnRef,
        verify.vnp_Amount,
        verify.vnp_TransactionNo || '',
        verify.isSuccess
      );
      return res.json({ RspCode: '00', Message: 'Confirm Success' });
    } catch (error) {
      return res.json({ RspCode: '99', Message: 'Unknown error' });
    }
  }
}

export default PaymentController;