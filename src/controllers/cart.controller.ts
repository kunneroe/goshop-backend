import { Request, Response } from "express";
import { cartService } from "../services/cart.service";

export const cartController = {
  async getCart(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const cart = await cartService.getCart(userId);
      return res.status(200).json({ cart });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  },

  async addItem(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { productId, quantity } = req.body;

      if (!productId || typeof quantity !== "number") {
        return res.status(400).json({ error: "productId and quantity are required" });
      }

      const cart = await cartService.addItem(userId, productId, quantity);
      return res.status(200).json({ cart });
    } catch (error: any) {
      if (error.message.includes("Your cart already contains items from another supermarket")) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message.includes("Product")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  },

  async updateItemQuantity(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const itemId = req.params.itemId;
      const { quantity } = req.body;

      if (typeof quantity !== "number") {
        return res.status(400).json({ error: "quantity is required" });
      }

      const cart = await cartService.updateItemQuantity(userId, itemId, quantity);
      return res.status(200).json({ cart });
    } catch (error: any) {
      if (error.message.includes("Item not found") || error.message.includes("Cart not found")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  },

  async deleteItem(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const itemId = req.params.itemId;

      const cart = await cartService.deleteItem(userId, itemId);
      return res.status(200).json({ cart });
    } catch (error: any) {
      if (error.message.includes("Item not found") || error.message.includes("Cart not found")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  },

  async clearCart(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const cart = await cartService.clearCart(userId);
      return res.status(200).json({ cart });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  },
};
