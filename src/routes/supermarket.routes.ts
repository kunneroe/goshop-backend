import { Router } from "express";
import { supermarketController } from "../controllers/supermarket.controller";
import { productController } from "../controllers/product.controller";

const supermarketRouter = Router();

supermarketRouter.get("/", supermarketController.getAll);
supermarketRouter.get("/:id", supermarketController.getById);
supermarketRouter.get("/:id/products", productController.getSupermarketProducts);

export { supermarketRouter };
