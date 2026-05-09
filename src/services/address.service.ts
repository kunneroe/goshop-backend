import { prisma } from "../prisma/client";

export class AddressService {
  async getUserAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    });
  }

  async createAddress(userId: string, data: any) {
    const isDefault = data.isDefault === true;

    if (isDefault) {
      const [, newAddress] = await prisma.$transaction([
        prisma.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        }),
        prisma.address.create({
          data: {
            ...data,
            userId,
            isDefault: true,
          },
        }),
      ]);
      return newAddress;
    }

    return prisma.address.create({
      data: {
        ...data,
        userId,
        isDefault: false,
      },
    });
  }

  async updateAddress(userId: string, addressId: string, data: any) {
    const isDefault = data.isDefault === true;

    if (isDefault) {
      const [, updatedAddress] = await prisma.$transaction([
        prisma.address.updateMany({
          where: { userId, isDefault: true, id: { not: addressId } },
          data: { isDefault: false },
        }),
        prisma.address.update({
          where: { id: addressId, userId },
          data,
        }),
      ]);
      return updatedAddress;
    }

    return prisma.address.update({
      where: { id: addressId, userId },
      data,
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    return prisma.address.delete({
      where: { id: addressId, userId },
    });
  }

  async setDefaultAddress(userId: string, addressId: string) {
    const [, updatedAddress] = await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      }),
      prisma.address.update({
        where: { id: addressId, userId },
        data: { isDefault: true },
      }),
    ]);
    return updatedAddress;
  }
}

export const addressService = new AddressService();
