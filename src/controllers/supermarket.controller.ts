import { Request, Response } from "express";
import { supermarketService } from "../services/supermarket.service";

export const supermarketController = {
  async getAll(req: Request, res: Response) {
    try {
      const { city, state, status, search } = req.query;
      const supermarkets = await supermarketService.getAll({
        city: city as string,
        state: state as string,
        status: status as string,
        search: search as string,
      });
      return res.status(200).json({ supermarkets });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const supermarket = await supermarketService.getById(req.params.id);
      if (!supermarket) {
        return res.status(404).json({ error: "Supermarket not found" });
      }
      return res.status(200).json({ supermarket });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  },
};
