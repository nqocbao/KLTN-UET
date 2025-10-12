import { Request, Response } from "express";
import Entity from "../../models/entities.model.js";

// Get all entities
export const getAllEntities = async (req: Request, res: Response) => {
  try {
    const entities = await Entity.find();
    res.status(200).json({ success: true, data: entities });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get entity by ID
export const getEntityById = async (req: Request, res: Response) => {
  try {
    const entity = await Entity.findById(req.params.id);

    if (!entity) {
      return res.status(404).json({
        success: false,
        message: "Entity not found",
      });
    }

    res.status(200).json({ success: true, data: entity });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create entity
export const createEntity = async (req: Request, res: Response) => {
  try {
    const entity = await Entity.create(req.body);
    res.status(201).json({ success: true, data: entity });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update entity
export const updateEntity = async (req: Request, res: Response) => {
  try {
    const entity = await Entity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!entity) {
      return res.status(404).json({
        success: false,
        message: "Entity not found",
      });
    }

    res.status(200).json({ success: true, data: entity });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete entity
export const deleteEntity = async (req: Request, res: Response) => {
  try {
    const entity = await Entity.findByIdAndDelete(req.params.id);

    if (!entity) {
      return res.status(404).json({
        success: false,
        message: "Entity not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Entity deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
