import { Request, Response } from "express";
import { addressService } from "../services/address.service";
import { AddressLabel } from "@prisma/client";

export const addressController = {
  async getUserAddresses(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const addresses = await addressService.getUserAddresses(userId);
      return res.status(200).json({ addresses });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  },

  async createAddress(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const {
        label,
        labelOther,
        recipientName,
        recipientPhone,
        line1,
        line2,
        city,
        state,
        country,
        postalCode,
        latitude,
        longitude,
        isDefault,
      } = req.body;

      if (!label || !line1 || !city || !state) {
        return res.status(400).json({ error: "Missing required fields: label, line1, city, state" });
      }

      if (!Object.values(AddressLabel).includes(label)) {
        return res.status(400).json({ error: "Invalid address label" });
      }

      const address = await addressService.createAddress(userId, {
        label,
        labelOther,
        recipientName,
        recipientPhone,
        line1,
        line2,
        city,
        state,
        country,
        postalCode,
        latitude,
        longitude,
        isDefault,
      });

      return res.status(201).json({ address });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  },

  async updateAddress(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const addressId = req.params.id;
      
      const {
        label,
        labelOther,
        recipientName,
        recipientPhone,
        line1,
        line2,
        city,
        state,
        country,
        postalCode,
        latitude,
        longitude,
        isDefault,
      } = req.body;

      if (label && !Object.values(AddressLabel).includes(label)) {
        return res.status(400).json({ error: "Invalid address label" });
      }

      const address = await addressService.updateAddress(userId, addressId, {
        label,
        labelOther,
        recipientName,
        recipientPhone,
        line1,
        line2,
        city,
        state,
        country,
        postalCode,
        latitude,
        longitude,
        isDefault,
      });

      return res.status(200).json({ address });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: "Address not found or does not belong to user" });
      }
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  },

  async deleteAddress(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const addressId = req.params.id;
      await addressService.deleteAddress(userId, addressId);
      return res.status(200).json({ message: "Address deleted successfully" });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: "Address not found" });
      }
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  },

  async setDefaultAddress(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const addressId = req.params.id;
      const address = await addressService.setDefaultAddress(userId, addressId);
      return res.status(200).json({ address });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: "Address not found or does not belong to user" });
      }
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  },
};
