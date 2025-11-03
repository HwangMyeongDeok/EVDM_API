import { Request, Response, NextFunction } from "express";
import { PaymentService } from "./payment.service";
import { PaymentMethod } from "./payment.model";

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
}

export default PaymentController;
