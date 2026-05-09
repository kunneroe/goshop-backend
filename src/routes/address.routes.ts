import { Router } from "express";
import { addressController } from "../controllers/address.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const addressRouter = Router();

// Protect all address routes
addressRouter.use(authMiddleware);

addressRouter.get("/", addressController.getUserAddresses);
addressRouter.post("/", addressController.createAddress);
addressRouter.patch("/:id", addressController.updateAddress);
addressRouter.delete("/:id", addressController.deleteAddress);
addressRouter.patch("/:id/default", addressController.setDefaultAddress);

export { addressRouter };
