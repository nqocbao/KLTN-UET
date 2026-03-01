import type { Request, Response } from "express";
import Tour from "../../models/tours.model.js";

// Get all tours
export const getAllTours = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const { 
      country_id, 
      guide_id, 
      location, 
      destination_id, 
      location_id,
      location_type,
      departure_province_id,
      departure,
      minPrice, 
      maxPrice, 
      from, 
      sortBy,
      status,
      is_domestic
    } = req.query;
    const filter: any = {};

    // Status filter (active/inactive)
    if (status && status !== '') {
      filter.status = status;
    }

    // Is domestic filter (Việt Nam / Nước ngoài)
    if (is_domestic !== undefined && is_domestic !== '') {
      const Country = (await import('../../models/countries.model.js')).default;
      const vietnamCountry = await Country.findOne({ code: 'VN' }).select('_id');
      
      if (vietnamCountry) {
        if (is_domestic === 'true') {
          // Tour trong nước (Việt Nam)
          filter.country_id = vietnamCountry._id;
        } else if (is_domestic === 'false') {
          // Tour nước ngoài (không phải Việt Nam)
          filter.country_id = { $ne: vietnamCountry._id };
        }
      }
    }

    // Existing filters
    if (guide_id) filter.guide_id = guide_id;

    // ĐIỂM ĐẾN (Destination) Filter - Search by country_id or destinations
    // Priority 1: destination_id (find tours going to this specific destination)
    if (destination_id && destination_id !== '') {
      // Find country of this destination to search tours
      const Destination = (await import('../../models/destinations.model.js')).default;
      const dest = await Destination.findById(destination_id).select('country_id');
      if (dest?.country_id) {
        filter.country_id = dest.country_id;
      }
    } 
    // Priority 2: country_id directly
    else if (country_id && country_id !== '') {
      filter.country_id = country_id;
    }
    // Priority 3: location_id with location_type
    else if (location_id && location_id !== '' && location_type) {
      if (location_type === 'country') {
        filter.country_id = location_id;
      } else if (location_type === 'province' || location_type === 'destination') {
        // Find destinations in this province/area and get their countries
        const Destination = (await import('../../models/destinations.model.js')).default;
        const matchingDestinations = await Destination.find({
          $or: [
            { province_id: location_id },
            { _id: location_id }
          ]
        }).select('country_id');
        
        if (matchingDestinations.length > 0) {
          const countryIds = [...new Set(matchingDestinations.map(d => d.country_id?.toString()).filter(Boolean))];
          if (countryIds.length > 0) {
            filter.country_id = countryIds.length === 1 ? countryIds[0] : { $in: countryIds };
          }
        }
      }
    }
    // Priority 4: location name (text search fallback)
    else if (location && location !== '') {
      // Search in tour name/description or find country by location
      filter.$or = [
        { name: { $regex: location, $options: 'i' } },
        { description: { $regex: location, $options: 'i' } }
      ];
    }

    // ĐIỂM KHỞI HÀNH (Departure Province) Filter - Using departure_location_id field
    if (departure_province_id && departure_province_id !== '') {
      filter.departure_location_id = departure_province_id;
    } else if (departure && departure !== '') {
      // Search province by name
      const Province = (await import('../../models/provinces.model.js')).default;
      const matchingProvinces = await Province.find({
        name: { $regex: departure, $options: 'i' }
      }).select('_id');
      
      if (matchingProvinces.length > 0) {
        filter.departure_location_id = { $in: matchingProvinces.map(p => p._id) };
      }
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.adult_price = {};
      if (minPrice !== undefined && minPrice !== '') {
        filter.adult_price.$gte = parseInt(minPrice as string);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        filter.adult_price.$lte = parseInt(maxPrice as string);
      }
    }

    // Departure date filter - departure_dates is an array, need to check if any date is in range [from, to]
    if (from && from !== '') {
      const fromDate = new Date(from as string);
      fromDate.setHours(0, 0, 0, 0); // Set to start of day
      const toDate = req.query.to && req.query.to !== '' ? new Date(req.query.to as string) : null;
      if (toDate) {
        toDate.setHours(23, 59, 59, 999); // Set to end of day
      }
      
      console.log('[Tours API] Date filter:', { 
        from: from, 
        to: req.query.to, 
        fromDate: fromDate.toISOString(), 
        toDate: toDate?.toISOString() 
      });
      
      if (toDate) {
        // If both from and to are specified, find tours with departure dates in range
        filter.departure_dates = { 
          $elemMatch: { 
            $gte: fromDate,
            $lte: toDate
          } 
        };
      } else {
        // If only from is specified, find tours with departure dates >= from
        filter.departure_dates = { $elemMatch: { $gte: fromDate } };
      }
    }

    // Log for debugging
    console.log('[Tours API] Query params:', { 
      country_id, 
      guide_id, 
      location, 
      destination_id, 
      location_id,
      location_type,
      departure_province_id,
      departure,
      minPrice, 
      maxPrice, 
      from, 
      to: req.query.to, 
      sortBy 
    });
    console.log('[Tours API] Filter object:', JSON.stringify(filter, null, 2));

    // Build sort object
    let sort: any = {};
    switch (sortBy) {
      case 'price_asc':
        sort = { adult_price: 1 };
        break;
      case 'price_desc':
        sort = { adult_price: -1 };
        break;
      case 'alphabet':
        sort = { name: 1 };
        break;
      case 'popularity':
      default:
        sort = { rating: -1 };
        break;
    }

    const tours = await Tour.find(filter)
      .populate("country_id")
      .populate("guide_id")
      .populate("departure_location_id")
      .populate("included_services")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Tour.countDocuments(filter);

    console.log(`[Tours API] Found ${tours.length} tours out of ${total} total`);

    res.status(200).json({
      success: true,
      data: tours,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('[Tours API] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get tour by ID
export const getTourById = async (req: Request, res: Response) => {
  try {
    const tour = await Tour.findById(req.params.id)
      .populate("country_id")
      .populate("guide_id")
      .populate("departure_location_id")
      .populate("included_services");

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    res.status(200).json({ success: true, data: tour });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create tour
export const createTour = async (req: Request, res: Response) => {
  try {
    const tour = await Tour.create(req.body);
    res.status(201).json({ success: true, data: tour });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update tour
export const updateTour = async (req: Request, res: Response) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    res.status(200).json({ success: true, data: tour });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete tour
export const deleteTour = async (req: Request, res: Response) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tour deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
