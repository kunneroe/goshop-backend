import { Request, Response } from "express";
import { authService } from "../services/auth.service";

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { fullName, email, phone, password } = req.body;

      if (!fullName || !password) {
        return res.status(400).json({ error: "FullName and password are required" });
      }

      const result = await authService.register({ fullName, email, phone, password });
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message || "Registration failed" });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({ error: "Identifier and password are required" });
      }

      const result = await authService.login({ identifier, password });
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(401).json({ error: error.message || "Login failed" });
    }
  },

  async me(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      return res.status(200).json({ user: req.user });
    } catch (error: any) {
      return res.status(500).json({ error: "Internal server error" });
    }
  },
};
