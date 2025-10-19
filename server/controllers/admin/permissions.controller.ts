import type { Request, Response } from "express";
import Permission from "../../models/permissions.model.js";

// Get all permissions
export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const permissions = await Permission.find()
      .skip(skip)
      .limit(limit);

    const total = await Permission.countDocuments();

    res.status(200).json({
      success: true,
      data: permissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get permission by ID
export const getPermissionById = async (req: Request, res: Response) => {
  try {
    const permission = await Permission.findById(req.params.id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permission not found",
      });
    }

    res.status(200).json({ success: true, data: permission });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create permission
export const createPermission = async (req: Request, res: Response) => {
  try {
    const permission = await Permission.create(req.body);
    res.status(201).json({ success: true, data: permission });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update permission
export const updatePermission = async (req: Request, res: Response) => {
  try {
    const permission = await Permission.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permission not found",
      });
    }

    res.status(200).json({ success: true, data: permission });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete permission
export const deletePermission = async (req: Request, res: Response) => {
  try {
    const permission = await Permission.findByIdAndDelete(req.params.id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permission not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Permission deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
