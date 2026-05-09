import { Router } from "express";
import { cartController } from "../controllers/cart.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const cartRouter = Router();

// Protect all cart routes
cartRouter.use(authMiddleware);

cartRouter.get("/", cartController.getCart);
cartRouter.post("/items", cartController.addItem);
cartRouter.patch("/items/:itemId", cartController.updateItemQuantity);
cartRouter.delete("/items/:itemId", cartController.deleteItem);
cartRouter.delete("/", cartController.clearCart);

export { cartRouter };
