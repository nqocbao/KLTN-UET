import type { Request, Response } from "express";
import Address from "../../models/addresses.model.js";

// Get all addresses
export const getAllAddresses = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;

    let query: any = {};

    if (search) {
      // Vì field address_detail chứa text có thể tìm kiếm
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { address_detail: searchRegex },
        // Có thể mở rộng tìm kiếm theo populate field nếu muốn, nhưng phức tạp hơn
        // Hiện tại chỉ search theo address_detail trực tiếp
      ];
    }

    const total = await Address.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const addresses = await Address.find(query)
      .populate("country_id")
      .populate("province_id")
      .populate("district_id")
      .populate("ward_id")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort mới nhất lên đầu

    res.status(200).json({
      success: true,
      data: addresses,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get address by ID
export const getAddressById = async (req: Request, res: Response) => {
  try {
    const address = await Address.findById(req.params.id)
      .populate("country_id")
      .populate("province_id")
      .populate("district_id")
      .populate("ward_id");

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.status(200).json({ success: true, data: address });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create address
export const createAddress = async (req: Request, res: Response) => {
  try {
    const address = await Address.create(req.body);
    res.status(201).json({ success: true, data: address });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update address
export const updateAddress = async (req: Request, res: Response) => {
  try {
    const address = await Address.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.status(200).json({ success: true, data: address });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete address
export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const address = await Address.findByIdAndDelete(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
