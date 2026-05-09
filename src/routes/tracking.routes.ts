import { Router } from "express";
import { trackingController } from "../controllers/tracking.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const trackingRouter = Router();

// Protect tracking routes
trackingRouter.use(authMiddleware);

trackingRouter.get("/:orderId/tracking", trackingController.getTracking);
trackingRouter.patch("/:orderId/assign-rider", trackingController.assignRider);
trackingRouter.patch("/:orderId/tracking-status", trackingController.updateTrackingStatus);

export { trackingRouter };
