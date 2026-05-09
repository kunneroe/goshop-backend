import { prisma } from "../prisma/client";
import { PaymentStatus } from "@prisma/client";

export class PaymentService {
  async getPayment(userId: string, orderId: string) {
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: {
        order: {
          select: {
            orderNumber: true,
            totalAmount: true,
            userId: true,
          },
        },
      },
    });

    if (!payment || payment.order.userId !== userId) {
      throw new Error("Payment not found or access denied");
    }

    return payment;
  }

  async mockConfirmPayment(userId: string, orderId: string) {
    const payment = await this.getPayment(userId, orderId);

    if (payment.status === PaymentStatus.SUCCESS) {
      throw new Error("Payment is already successful");
    }

    /* 
      =======================================================================
      FUTURE READINESS: REAL PAYMENT INTEGRATION (Paystack / Flutterwave)
      =======================================================================
      When you integrate a real payment gateway, the flow will change here:
      
      1. Initialization: 
         - The frontend will call a new endpoint (e.g., `POST /api/v1/payments/:orderId/initialize`).
         - Your backend will call Paystack/Flutterwave API to create a payment link/reference.
         - You will update the `Payment.reference` field in the database with the provider's reference.
         
      2. Verification / Webhook:
         - The payment provider will hit your webhook URL (e.g., `POST /api/v1/payments/webhook`).
         - You will verify the event signature.
         - If the event is `charge.success`, you will find the payment by `reference`.
         - THEN you will run the exact Prisma transaction below to mark it as SUCCESS.
      =======================================================================
    */

    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { orderId },
        data: {
          status: PaymentStatus.SUCCESS,
          paidAt: new Date(),
        },
      });

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.SUCCESS,
        },
      });

      return { payment: updatedPayment, orderSummary: updatedOrder };
    });

    return result;
  }

  async mockFailPayment(userId: string, orderId: string) {
    const payment = await this.getPayment(userId, orderId);

    if (payment.status === PaymentStatus.SUCCESS) {
      throw new Error("Cannot fail an already successful payment");
    }

    /* 
      =======================================================================
      FUTURE READINESS: REAL PAYMENT INTEGRATION (Paystack / Flutterwave)
      =======================================================================
      If the payment provider webhook sends a `charge.failed` event, or if 
      a user cancels the flow, you will run the logic below.
      =======================================================================
    */

    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { orderId },
        data: {
          status: PaymentStatus.FAILED,
          failedAt: new Date(),
        },
      });

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.FAILED,
        },
      });

      return { payment: updatedPayment, orderSummary: updatedOrder };
    });

    return result;
  }
}

export const paymentService = new PaymentService();
