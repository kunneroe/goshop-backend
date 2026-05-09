import { Request, Response } from "express";
import { categoryService } from "../services/category.service";

export const categoryController = {
  async getAll(req: Request, res: Response) {
    try {
      const categories = await categoryService.getAll();
      return res.status(200).json({ categories });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  },
};
