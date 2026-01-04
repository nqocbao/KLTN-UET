import type { Request, Response } from "express";
import Hotel from "../../models/hotels.model.js";
import Province from "../../models/provinces.model.js";
import District from "../../models/districts.model.js";
import Ward from "../../models/wards.model.js";
import Address from "../../models/addresses.model.js";
import Destination from "../../models/destinations.model.js";
import Country from "../../models/countries.model.js";

// Get all hotels
export const getAllHotels = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const locationQuery = req.query.location as string;
    const nameQuery = req.query.name as string;
    const sortBy = req.query.sortBy as string;
    const minPrice = parseInt(req.query.minPrice as string);
    const maxPrice = parseInt(req.query.maxPrice as string);
    const from = req.query.from as string;
    const to = req.query.to as string;

    let nights = 1;
    if (from && to) {
      const d1 = new Date(from);
      const d2 = new Date(to);
      const diff = Math.abs(d2.getTime() - d1.getTime());
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (days > 0) nights = days;
    }

    console.log(`[Search] Query: location="${locationQuery}", name="${nameQuery}", sortBy="${sortBy}", price=[${minPrice}, ${maxPrice}], nights=${nights}`);

    let query: any = {};
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      query.priceTwoSingleBed = {};
      if (!isNaN(minPrice)) query.priceTwoSingleBed.$gte = minPrice / nights;
      if (!isNaN(maxPrice)) query.priceTwoSingleBed.$lte = maxPrice / nights;
    }
    let sortOptions: any = { rating: -1 }; // Default

    if (sortBy === "popularity") {
      sortOptions = { rating: -1, _id: 1 };
    } else if (sortBy === "price_asc") {
      sortOptions = { priceTwoSingleBed: 1, rating: -1 };
    } else if (sortBy === "price_desc") {
      sortOptions = { priceTwoSingleBed: -1, rating: -1 };
    } else if (sortBy === "alphabet") {
      sortOptions = { name: 1, rating: -1 };
    } else {
      sortOptions = { rating: -1 };
    }

    console.log(`[Search] sortBy="${sortBy}" => sortOptions=`, sortOptions);

    if (nameQuery) {
      query.name = { $regex: nameQuery, $options: "i" };
    }

    if (locationQuery) {
      const parts = locationQuery.split(",").map(p => p.trim()).filter(p => p.length > 0);
      const provinceIds: any[] = [];
      const districtIds: any[] = [];
      const wardIds: any[] = [];
      const countryIds: any[] = [];

      for (const part of parts) {
        const partRegex = new RegExp(part, "i");
        const [c, p, d, w, dests] = await Promise.all([
          Country.find({ name: partRegex }).select("_id"),
          Province.find({ name: partRegex }).select("_id"),
          District.find({ name: partRegex }).select("_id"),
          Ward.find({ name: partRegex }).select("_id"),
          Destination.find({ name: partRegex }).populate("address_id").select("address_id"),
        ]);

        c.forEach(x => countryIds.push(x._id));
        p.forEach(x => provinceIds.push(x._id));
        d.forEach(x => districtIds.push(x._id));
        w.forEach(x => wardIds.push(x._id));
        
        dests.forEach((dest: any) => {
          if (dest.address_id) {
            const addr = dest.address_id;
            if (addr.province_id) provinceIds.push(addr.province_id);
            if (addr.district_id) districtIds.push(addr.district_id);
            if (addr.ward_id) wardIds.push(addr.ward_id);
          }
        });
      }

      const addressSearch: any[] = [
        { address_detail: { $regex: locationQuery, $options: "i" } }
      ];

      if (countryIds.length > 0) addressSearch.push({ country_id: { $in: countryIds } });
      if (provinceIds.length > 0) addressSearch.push({ province_id: { $in: provinceIds } });
      if (districtIds.length > 0) addressSearch.push({ district_id: { $in: districtIds } });
      if (wardIds.length > 0) addressSearch.push({ ward_id: { $in: wardIds } });

      const addresses = await Address.find({ $or: addressSearch }).select("_id");
      const addressIds = addresses.map((a) => a._id);

      console.log(`[Search] Found ${addressIds.length} addresses matching location criteria`);

      const orConditions: any[] = [
        { address_id: { $in: addressIds } },
        { location: { $regex: locationQuery, $options: "i" } }
      ];

      // Add name search as OR if it's the main location search
      orConditions.push({ name: { $regex: locationQuery, $options: "i" } });

      query.$or = orConditions;
    }

    console.log(`[Search] Applying Sort:`, sortOptions);
    console.log(`[Search] Final Query:`, JSON.stringify(query));

    const hotels = await Hotel.find(query)
      .populate("partner_id")
      .populate({
        path: "address_id",
        populate: [
          { path: "country_id" },
          { path: "province_id" },
          { path: "district_id" },
          { path: "ward_id" },
        ],
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await Hotel.countDocuments(query);

    console.log(`[Search] Results: Found ${hotels.length} hotels. First hotel price: ${hotels[0]?.priceTwoSingleBed}`);

    res.status(200).json({
      success: true,
      data: hotels,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error(`[Search] Error:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get hotel by ID
export const getHotelById = async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate("partner_id")
      .populate({
        path: "address_id",
        populate: [
          { path: "country_id" },
          { path: "province_id" },
          { path: "district_id" },
          { path: "ward_id" },
        ],
      });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    res.status(200).json({ success: true, data: hotel });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create hotel
export const createHotel = async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json({ success: true, data: hotel });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update hotel
export const updateHotel = async (req: Request, res: Response) => {
  try {
    console.log("Updating hotel:", req.params.id);
    console.log("Update data:", req.body);

    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    res.status(200).json({ success: true, data: hotel });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete hotel
export const deleteHotel = async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Hotel deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
