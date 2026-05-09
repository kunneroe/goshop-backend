import { Router } from "express";
import { checkoutController } from "../controllers/checkout.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const checkoutRouter = Router();

// Protect checkout
checkoutRouter.use(authMiddleware);

checkoutRouter.post("/", checkoutController.checkout);

export { checkoutRouter };
