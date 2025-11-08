import { Request, Response, NextFunction } from "express";
import { PaymentService } from "./payment.service";
import { PaymentMethod, PaymentStatus } from "./payment.model";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export class PaymentController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { contract_id, amount, payment_method } = req.body;

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
      const query = req.query as Record<string, string>; // VNPAY gửi qua query dù là POST

      const result = await PaymentService.verifyVNPAYReturn(query);

      // Không redirect, chỉ update status và return OK cho VNPAY
      res.status(200).send("OK");
    } catch (err) {
      console.error("VNPAY IPN error:", err);
      res.status(200).send("ERROR"); // VNPAY sẽ retry nếu không OK
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const paymentId = Number(req.params.id);
      if (!paymentId)
        return res
          .status(400)
          .json({ success: false, message: "Missing payment id" });

      const payment = await PaymentService.findById(paymentId);
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
      const user = req.user; // Assuming authMiddleware sets req.user with { user_id, role, dealer_id }
      if (!user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const payments = await PaymentService.getAll(user);
      res.status(200).json({ success: true, data: payments });
    } catch (err) {
      console.error("Get all payments error:", err);
      next(err);
    }
  }

}

export default PaymentController;
