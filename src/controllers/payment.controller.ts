import { Request, Response } from "express";
import { paymentService } from "../services/payment.service";

export const paymentController = {
  async getPayment(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const orderId = req.params.orderId;

      const payment = await paymentService.getPayment(userId, orderId);
      return res.status(200).json({ payment });
    } catch (error: any) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  },

  async mockConfirmPayment(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const orderId = req.params.orderId;

      const result = await paymentService.mockConfirmPayment(userId, orderId);
      return res.status(200).json(result);
    } catch (error: any) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes("already successful")) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  },

  async mockFailPayment(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const orderId = req.params.orderId;

      const result = await paymentService.mockFailPayment(userId, orderId);
      return res.status(200).json(result);
    } catch (error: any) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes("successful")) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  }
};
