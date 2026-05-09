import { prisma } from "../prisma/client";

export class CategoryService {
  async getAll() {
    return prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }
}

export const categoryService = new CategoryService();
