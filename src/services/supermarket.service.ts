import { prisma } from "../prisma/client";
import { Prisma } from "@prisma/client";

export class SupermarketService {
  async getAll(filters: { city?: string; state?: string; status?: string; search?: string }) {
    const where: Prisma.SupermarketWhereInput = {};

    if (filters.city) {
      where.city = { equals: filters.city, mode: "insensitive" };
    }
    if (filters.state) {
      where.state = { equals: filters.state, mode: "insensitive" };
    }
    if (filters.status) {
      where.status = filters.status as any;
    }
    if (filters.search) {
      where.name = { contains: filters.search, mode: "insensitive" };
    }

    return prisma.supermarket.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        area: true,
        city: true,
        state: true,
        rating: true,
        etaMinMinutes: true,
        etaMaxMinutes: true,
        deliveryFee: true,
        status: true,
        imageUrl: true,
      },
    });
  }

  async getById(id: string) {
    return prisma.supermarket.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        phone: true,
        email: true,
        addressLine: true,
        area: true,
        city: true,
        state: true,
        country: true,
        latitude: true,
        longitude: true,
        rating: true,
        etaMinMinutes: true,
        etaMaxMinutes: true,
        deliveryFee: true,
        status: true,
        imageUrl: true,
      },
    });
  }
}

export const supermarketService = new SupermarketService();
