import { Router } from "express";
import { orderController } from "../controllers/order.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const orderRouter = Router();

// Protect order routes
orderRouter.use(authMiddleware);

orderRouter.get("/", orderController.getOrders);
orderRouter.get("/:id", orderController.getOrderById);
orderRouter.get("/:id/status-history", orderController.getStatusHistory);
orderRouter.patch("/:id/status", orderController.updateOrderStatus);

export { orderRouter };
