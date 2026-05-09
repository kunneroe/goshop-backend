import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const paymentRouter = Router();

// Protect payment routes
paymentRouter.use(authMiddleware);

paymentRouter.get("/:orderId", paymentController.getPayment);
paymentRouter.post("/:orderId/mock-confirm", paymentController.mockConfirmPayment);
paymentRouter.post("/:orderId/mock-fail", paymentController.mockFailPayment);

export { paymentRouter };
