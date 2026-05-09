import { Request, Response } from "express";
import { checkoutService } from "../services/checkout.service";
import { PaymentMethod } from "@prisma/client";

export const checkoutController = {
  async checkout(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { addressId, paymentMethod, deliveryNote } = req.body;

      if (!addressId || !paymentMethod) {
        return res.status(400).json({ error: "addressId and paymentMethod are required" });
      }

      if (!Object.values(PaymentMethod).includes(paymentMethod)) {
        return res.status(400).json({ error: "Invalid payment method" });
      }

      const order = await checkoutService.processCheckout(userId, addressId, paymentMethod, deliveryNote);
      
      return res.status(201).json({ order });
    } catch (error: any) {
      if (error.message.includes("Cart is empty") || 
          error.message.includes("Cart is not bound") || 
          error.message.includes("Invalid address")) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  }
};
