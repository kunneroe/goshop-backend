import { prisma } from "../prisma/client";
import { PaymentMethod, OrderStatus, PaymentStatus } from "@prisma/client";

export class CheckoutService {
  async processCheckout(
    userId: string,
    addressId: string,
    paymentMethod: PaymentMethod,
    deliveryNote?: string
  ) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        supermarket: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }
    if (!cart.supermarketId || !cart.supermarket) {
      throw new Error("Cart is not bound to a supermarket");
    }

    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== userId) {
      throw new Error("Invalid address");
    }

    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.lineTotal), 0);
    const deliveryFee = Number(cart.supermarket.deliveryFee);
    const serviceFee = 100;
    const totalAmount = subtotal + deliveryFee + serviceFee;

    // Generate GOS-TIMESTAMP-RANDOM format
    const timestampHex = Math.floor(Date.now() / 1000).toString(16).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `GOS-${timestampHex}-${randomNum}`;

    const order = await prisma.$transaction(async (tx) => {
      // 1. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          supermarketId: cart.supermarketId!,
          addressId,
          deliveryNote,
          subtotal,
          deliveryFee,
          serviceFee,
          totalAmount,
          paymentMethod,
        },
      });

      // 2. Create OrderItems
      const orderItemsData = cart.items.map((item) => ({
        orderId: newOrder.id,
        productId: item.productId,
        productName: item.product.name,
        productUnit: item.product.unit,
        productImageUrl: item.product.imageUrl,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
      }));

      await tx.orderItem.createMany({
        data: orderItemsData,
      });

      // 3. Create Payment
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          method: paymentMethod,
          status: PaymentStatus.PENDING,
          amount: totalAmount,
        },
      });

      // 4. Create OrderStatusHistory
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          status: OrderStatus.CONFIRMED,
          note: "Order placed successfully",
          createdByUserId: userId,
        },
      });

      // 5. Clear Cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
      await tx.cart.update({
        where: { id: cart.id },
        data: { supermarketId: null },
      });

      return newOrder;
    });

    // Return fully populated order
    return prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: true,
        payment: true,
        statusHistory: true,
        supermarket: true,
        address: true,
      },
    });
  }
}

export const checkoutService = new CheckoutService();
