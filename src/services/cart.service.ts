import { prisma } from "../prisma/client";
import { Prisma } from "@prisma/client";

export class CartService {
  async getCart(userId: string) {
    let cart = await prisma.cart.findUnique({
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

    if (!cart) {
      return {
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        serviceFee: 0,
        total: 0,
      };
    }

    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.lineTotal), 0);
    const deliveryFee = cart.supermarket ? Number(cart.supermarket.deliveryFee) : 0;
    const serviceFee = cart.items.length > 0 ? 100 : 0;
    const total = subtotal + deliveryFee + serviceFee;

    return {
      ...cart,
      subtotal,
      deliveryFee,
      serviceFee,
      total,
    };
  }

  async addItem(userId: string, productId: string, quantity: number) {
    if (quantity < 1) throw new Error("Quantity must be at least 1");

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) throw new Error("Product not found");
    if (!product.isAvailable) throw new Error("Product is currently unavailable");

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          supermarketId: product.supermarketId,
        },
        include: { items: true },
      });
    }

    if (!cart.supermarketId) {
      cart = await prisma.cart.update({
        where: { id: cart.id },
        data: { supermarketId: product.supermarketId },
        include: { items: true },
      });
    } else if (cart.supermarketId !== product.supermarketId) {
      throw new Error("Your cart already contains items from another supermarket. Clear cart before shopping from a new supermarket.");
    }

    const existingItem = cart.items.find(item => item.productId === productId);
    const unitPrice = Number(product.price);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          unitPrice: unitPrice,
          lineTotal: newQuantity * unitPrice,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          quantity: quantity,
          unitPrice: unitPrice,
          lineTotal: quantity * unitPrice,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number) {
    if (quantity < 1) throw new Error("Quantity must be at least 1");

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) throw new Error("Cart not found");

    const item = cart.items.find(i => i.id === itemId);
    if (!item) throw new Error("Item not found in your cart");

    const unitPrice = Number(item.unitPrice);

    await prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity,
        lineTotal: quantity * unitPrice,
      },
    });

    return this.getCart(userId);
  }

  async deleteItem(userId: string, itemId: string) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) throw new Error("Cart not found");

    const item = cart.items.find(i => i.id === itemId);
    if (!item) throw new Error("Item not found in your cart");

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    if (cart.items.length === 1) { // It was the last item
      await prisma.cart.update({
        where: { id: cart.id },
        data: { supermarketId: null },
      });
    }

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) return this.getCart(userId);

    await prisma.$transaction([
      prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      }),
      prisma.cart.update({
        where: { id: cart.id },
        data: { supermarketId: null },
      }),
    ]);

    return this.getCart(userId);
  }
}

export const cartService = new CartService();
