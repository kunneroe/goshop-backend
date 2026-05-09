import { Request, Response } from "express";
import { orderService } from "../services/order.service";
import { OrderStatus } from "@prisma/client";

export const orderController = {
  async getOrders(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const status = req.query.status as OrderStatus;
      const activeOnly = req.query.activeOnly === 'true';
      const pastOnly = req.query.pastOnly === 'true';

      const orders = await orderService.getOrders(userId, { status, activeOnly, pastOnly });
      return res.status(200).json({ orders });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  },

  async getOrderById(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;

      const order = await orderService.getOrderById(userId, orderId);
      return res.status(200).json({ order });
    } catch (error: any) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  },

  async getStatusHistory(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;

      const history = await orderService.getStatusHistory(userId, orderId);
      return res.status(200).json({ history });
    } catch (error: any) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  },

  async updateOrderStatus(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;
      const { status, note } = req.body;

      if (!status || !Object.values(OrderStatus).includes(status)) {
        return res.status(400).json({ error: "Valid status is required" });
      }

      const order = await orderService.updateOrderStatus(userId, orderId, status, note);
      return res.status(200).json({ order });
    } catch (error: any) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  }
};
