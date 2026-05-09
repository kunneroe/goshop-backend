import { prisma } from "../prisma/client";
import { Prisma } from "@prisma/client";

export class ProductService {
  async getSupermarketProducts(
    supermarketId: string,
    filters: { categoryId?: string; search?: string; availableOnly?: boolean }
  ) {
    const where: Prisma.ProductWhereInput = {
      supermarketId,
    };

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters.search) {
      where.name = { contains: filters.search, mode: "insensitive" };
    }
    if (filters.availableOnly) {
      where.isAvailable = true;
      where.stockQty = { gt: 0 };
    }

    return prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        currency: true,
        unit: true,
        imageUrl: true,
        stockQty: true,
        isAvailable: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
        supermarket: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  async getById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        sku: true,
        price: true,
        currency: true,
        unit: true,
        imageUrl: true,
        stockQty: true,
        isAvailable: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
        supermarket: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }
}

export const productService = new ProductService();
