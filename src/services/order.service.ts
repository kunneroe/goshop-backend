import { prisma } from "../prisma/client";
import { OrderStatus } from "@prisma/client";

export class OrderService {
  async getOrders(userId: string, filters: { status?: OrderStatus, activeOnly?: boolean, pastOnly?: boolean } = {}) {
    let whereClause: any = { userId };

    if (filters.status) {
      whereClause.status = filters.status;
    } else if (filters.activeOnly) {
      whereClause.status = { notIn: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] };
    } else if (filters.pastOnly) {
      whereClause.status = { in: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] };
    }

    return prisma.order.findMany({
      where: whereClause,
      orderBy: { placedAt: "desc" },
      include: {
        supermarket: {
          select: { name: true, imageUrl: true }
        },
        payment: {
          select: { status: true, amount: true }
        }
      }
    });
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payment: true,
        statusHistory: {
          orderBy: { createdAt: "desc" }
        },
        supermarket: true,
        address: true,
        rider: true,
      },
    });

    if (!order || order.userId !== userId) {
      throw new Error("Order not found or access denied");
    }

    return order;
  }

  async getStatusHistory(userId: string, orderId: string) {
    // Validate access
    await this.getOrderById(userId, orderId);

    return prisma.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateOrderStatus(userId: string, orderId: string, status: OrderStatus, note?: string) {
    // Validate access
    await this.getOrderById(userId, orderId);

    const updateData: any = { status };
    if (status === OrderStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    }

    const order = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: updateData,
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status,
          note,
          createdByUserId: userId,
        },
      });

      return updatedOrder;
    });

    return order;
  }
}

export const orderService = new OrderService();
