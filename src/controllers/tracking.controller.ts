import { Request, Response } from "express";
import { trackingService } from "../services/tracking.service";

export const trackingController = {
  async getTracking(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const orderId = req.params.orderId;

      const tracking = await trackingService.getTracking(userId, orderId);
      return res.status(200).json({ tracking });
    } catch (error: any) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  },

  async assignRider(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const orderId = req.params.orderId;
      const payload = req.body;

      if (!payload.fullName || !payload.phone) {
        return res.status(400).json({ error: "fullName and phone are required" });
      }

      const order = await trackingService.assignRider(userId, orderId, payload);
      return res.status(200).json({ order });
    } catch (error: any) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  },

  async updateTrackingStatus(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const orderId = req.params.orderId;
      const payload = req.body;

      if (!payload.status) {
        return res.status(400).json({ error: "status is required" });
      }

      const tracking = await trackingService.updateTrackingStatus(userId, orderId, payload);
      return res.status(200).json({ tracking });
    } catch (error: any) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes("Invalid")) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  }
};
