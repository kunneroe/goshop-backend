import { prisma } from "../prisma/client";
import { OrderStatus } from "@prisma/client";

export class TrackingService {
  async getTracking(userId: string, orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        supermarket: {
          select: { name: true, addressLine: true, etaMinMinutes: true, etaMaxMinutes: true }
        },
        address: true,
        rider: {
          select: { id: true, fullName: true, phone: true, vehicleType: true, vehiclePlate: true, rating: true }
        },
        riderLocations: {
          orderBy: { recordedAt: "desc" },
          take: 1
        },
        statusHistory: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!order || order.userId !== userId) {
      throw new Error("Order not found or access denied");
    }

    const etaPlaceholder = order.supermarket.etaMinMinutes && order.supermarket.etaMaxMinutes
      ? `${order.supermarket.etaMinMinutes} - ${order.supermarket.etaMaxMinutes} mins`
      : "ETA Pending";

    /* 
      =======================================================================
      FUTURE READINESS: REAL-TIME TRACKING (WebSockets)
      =======================================================================
      Currently, clients must poll this endpoint to get updates. 
      In the future, you will establish a WebSocket connection. When the 
      rider app pushes a location update, the backend will emit an event 
      (e.g., `rider_location_update`) directly to the connected user's socket 
      room containing this payload.
      =======================================================================
    */

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      eta: etaPlaceholder,
      deliveryAddress: order.address,
      supermarket: order.supermarket,
      rider: order.rider || "Rider is not assigned yet",
      latestLocation: order.riderLocations.length > 0 ? order.riderLocations[0] : null,
      statusTimeline: order.statusHistory
    };
  }

  async assignRider(userId: string, orderId: string, payload: {
    fullName: string;
    phone: string;
    vehicleType?: string;
    vehiclePlate?: string;
    rating?: number;
    latitude?: number;
    longitude?: number;
  }) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== userId) {
      throw new Error("Order not found or access denied");
    }

    const result = await prisma.$transaction(async (tx) => {
      // Find or create rider
      let rider = await tx.rider.findUnique({ where: { phone: payload.phone } });
      
      if (!rider) {
        rider = await tx.rider.create({
          data: {
            fullName: payload.fullName,
            phone: payload.phone,
            vehicleType: payload.vehicleType,
            vehiclePlate: payload.vehiclePlate,
            rating: payload.rating,
          }
        });
      }

      // Assign rider and update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          riderId: rider.id,
          status: OrderStatus.RIDER_ASSIGNED
        },
        include: { rider: true }
      });

      // Add status history
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.RIDER_ASSIGNED,
          note: `Rider ${rider.fullName} assigned`,
          createdByUserId: userId,
        }
      });

      // Optionally record initial location
      if (payload.latitude && payload.longitude) {
        await tx.riderLocation.create({
          data: {
            riderId: rider.id,
            orderId: order.id,
            latitude: payload.latitude,
            longitude: payload.longitude,
          }
        });
      }

      return updatedOrder;
    });

    return result;
  }

  async updateTrackingStatus(userId: string, orderId: string, payload: {
    status: OrderStatus;
    note?: string;
    latitude?: number;
    longitude?: number;
  }) {
    const allowedStatuses = [
      OrderStatus.RIDER_ASSIGNED, 
      OrderStatus.PICKED_UP, 
      OrderStatus.ON_THE_WAY, 
      OrderStatus.DELIVERED
    ];

    if (!allowedStatuses.includes(payload.status)) {
      throw new Error("Invalid tracking status update");
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== userId) {
      throw new Error("Order not found or access denied");
    }

    /* 
      =======================================================================
      FUTURE READINESS: ROUTING (Google Maps / Mapbox)
      =======================================================================
      When `latitude` and `longitude` arrive here, you could asynchronously 
      call the Google Maps Distance Matrix API or Mapbox Navigation API to 
      calculate the precise driving time remaining between these coordinates 
      and the customer's `order.addressId` coordinates. You would then 
      dynamically update the `eta` field.
      =======================================================================
    */

    const result = await prisma.$transaction(async (tx) => {
      const updateData: any = { status: payload.status };
      if (payload.status === OrderStatus.DELIVERED) {
        updateData.deliveredAt = new Date();
      }

      await tx.order.update({
        where: { id: orderId },
        data: updateData
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: payload.status,
          note: payload.note,
          createdByUserId: userId,
        }
      });

      if (payload.latitude && payload.longitude && order.riderId) {
        await tx.riderLocation.create({
          data: {
            riderId: order.riderId,
            orderId: order.id,
            latitude: payload.latitude,
            longitude: payload.longitude,
          }
        });
      }

      return this.getTracking(userId, orderId);
    });

    return result;
  }
}

export const trackingService = new TrackingService();
