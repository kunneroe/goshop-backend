import { Request, Response } from "express";
import { productService } from "../services/product.service";

export const productController = {
  async getSupermarketProducts(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { categoryId, search, availableOnly } = req.query;
      
      const products = await productService.getSupermarketProducts(id, {
        categoryId: categoryId as string,
        search: search as string,
        availableOnly: availableOnly === "true",
      });
      
      return res.status(200).json({ products });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await productService.getById(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      return res.status(200).json({ product });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  },
};
