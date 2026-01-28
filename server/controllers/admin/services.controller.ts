import type { Request, Response } from "express";
import Service from "../../models/services.model.js";

// Get all services
export const getAllServices = async (req: Request, res: Response) => {
  try {
    const { category, is_active } = req.query;
    const filter: any = {};

    if (category) filter.category = category;
    if (is_active !== undefined) filter.is_active = is_active === "true";

    const services = await Service.find(filter).sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get service by ID
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({ success: true, data: service });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create service
export const createService = async (req: Request, res: Response) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({ success: true, data: service });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update service
export const updateService = async (req: Request, res: Response) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({ success: true, data: service });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete service
export const deleteService = async (req: Request, res: Response) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
