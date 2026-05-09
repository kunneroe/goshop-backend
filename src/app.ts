import cors from "cors";
import express from "express";
import { healthRouter } from "./routes/health.routes";
import { authRouter } from "./routes/auth.routes";
import { supermarketRouter } from "./routes/supermarket.routes";
import { categoryRouter } from "./routes/category.routes";
import { productRouter } from "./routes/product.routes";
import { addressRouter } from "./routes/address.routes";
import { cartRouter } from "./routes/cart.routes";
import { checkoutRouter } from "./routes/checkout.routes";
import { orderRouter } from "./routes/order.routes";
import { paymentRouter } from "./routes/payment.routes";

export const app = express();

app.use(cors());
app.use(express.json());

// Mount app routes
app.use("/", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/supermarkets", supermarketRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/addresses", addressRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/checkout", checkoutRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/payments", paymentRouter);
