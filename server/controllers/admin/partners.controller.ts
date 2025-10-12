import { Request, Response } from "express";
import Partner from "../../models/partners.model.js";

// Get all partners
export const getAllPartners = async (req: Request, res: Response) => {
  try {
    const { type, country_id } = req.query;
    const filter: any = {};

    if (type) filter.type = type;
    if (country_id) filter.country_id = country_id;

    const partners = await Partner.find(filter)
      .populate("country_id")
      .populate("address_id");

    res.status(200).json({ success: true, data: partners });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get partner by ID
export const getPartnerById = async (req: Request, res: Response) => {
  try {
    const partner = await Partner.findById(req.params.id)
      .populate("country_id")
      .populate("address_id");

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    res.status(200).json({ success: true, data: partner });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create partner
export const createPartner = async (req: Request, res: Response) => {
  try {
    const partner = await Partner.create(req.body);
    res.status(201).json({ success: true, data: partner });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update partner
export const updatePartner = async (req: Request, res: Response) => {
  try {
    const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    res.status(200).json({ success: true, data: partner });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete partner
export const deletePartner = async (req: Request, res: Response) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Partner deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
