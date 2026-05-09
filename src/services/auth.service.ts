import { prisma } from "../prisma/client";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";

export class AuthService {
  async register(data: { fullName: string; email?: string; phone?: string; password: string }) {
    if (!data.email && !data.phone) {
      throw new Error("Either email or phone is required");
    }

    if (data.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingEmail) throw new Error("Email already in use");
    }

    if (data.phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone: data.phone } });
      if (existingPhone) throw new Error("Phone already in use");
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email || undefined,
        phone: data.phone || undefined,
        passwordHash,
      },
    });

    const token = generateToken({ userId: user.id });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async login(data: { identifier: string; password: string }) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.identifier }, { phone: data.identifier }],
      },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await comparePassword(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = generateToken({ userId: user.id });
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }
}

export const authService = new AuthService();
