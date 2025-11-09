import { Request, Response, NextFunction } from "express";
import { PaymentService } from "./payment.service";
import { PaymentMethod, PaymentStatus } from "./payment.model";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export class PaymentController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { contract_id, amount, payment_method } = req.body;

      const user = req.user;
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      if (!contract_id || !amount || !payment_method) {
        return res
          .status(400)
          .json({ success: false, message: "Thiếu thông tin bắt buộc" });
      }

      if (amount <= 0) {
        return res
          .status(400)
          .json({ success: false, message: "Số tiền phải lớn hơn 0" });
      }

      const ipAddr =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
        req.socket.remoteAddress ||
        "127.0.0.1";

      const result = await PaymentService.create({
        contract_id: Number(contract_id),
        amount: Number(amount),
        payment_method: payment_method as PaymentMethod,
        ipAddr,
        user: user,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      console.error("Payment creation error:", err);
      next(err);
    }
  }

  async vnpayReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, string>;

      const result = await PaymentService.verifyVNPAYReturn(query);

      const status =
        result.isValid && result.responseCode === "00" ? "success" : "failed";
      const redirectUrl = `${FRONTEND_URL}/dealer/staff/payment-status?status=${status}&txnRef=${result.txnRef}&responseCode=${result.responseCode}`;

      res.redirect(redirectUrl);
    } catch (err) {
      console.error("VNPAY return error:", err);
      res.redirect(`${FRONTEND_URL}/payment-status?status=error`);
    }
  }

  async vnpayIpn(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, string>;

      await PaymentService.verifyVNPAYReturn(query);

      res.status(200).json({ RspCode: "00", Message: "Success" });
    } catch (err) {
      console.error("VNPAY IPN error:", err);
      res.status(200).json({ RspCode: "99", Message: "Failed" });
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const paymentId = Number(req.params.id);

      const user = req.user;
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      if (!paymentId)
        return res
          .status(400)
          .json({ success: false, message: "Missing payment id" });

      const payment = await PaymentService.findById(paymentId, user);
      if (!payment)
        return res
          .status(404)
          .json({ success: false, message: "Payment not found" });

      res.status(200).json({ success: true, data: payment });
    } catch (err) {
      console.error("Get payment error:", err);
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

     const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const status = req.query.status as PaymentStatus | undefined;
      const contract_id = req.query.contract_id ? Number(req.query.contract_id) : undefined;

      const result = await PaymentService.findAll({
        user,
        page,
        limit,
        status,
        contract_id
      });
      
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      console.error("Get all payments error:", err);
      next(err);
    }
  }
}

export default PaymentController;
