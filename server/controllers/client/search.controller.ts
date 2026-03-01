import type { Request, Response } from "express";
import Tour from "../../models/tours.model.js";
import Destination from "../../models/destinations.model.js";
import Province from "../../models/provinces.model.js";
import Country from "../../models/countries.model.js";

/**
 * Smart Search - Tìm kiếm thông minh qua nhiều nguồn
 * Tìm tours, destinations, provinces, countries cùng lúc
 */
export const smartSearch = async (req: Request, res: Response) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.json({
        success: true,
        data: {
          tours: [],
          destinations: [],
          provinces: [],
          countries: []
        }
      });
    }

    const searchQuery = q.trim();
    const searchRegex = { $regex: searchQuery, $options: 'i' };
    const limitNum = Math.min(parseInt(limit as string), 20);

    // Tìm kiếm song song
    const [tours, destinations, provinces, countries] = await Promise.all([
      // 🎫 Tìm tours theo tên và description
      Tour.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      })
      .select('_id name description adult_price duration_days rating images country_id')
      .populate('country_id', 'name')
      .limit(limitNum)
      .lean(),

      // 🏖️ Tìm destinations
      Destination.find({
        $or: [
          { name: searchRegex },
          { city: searchRegex },
          { description: searchRegex }
        ]
      })
      .select('_id name city description country_id province_id category type')
      .limit(limitNum)
      .lean(),

      // 🏙️ Tìm provinces
      Province.find({ name: searchRegex })
      .select('_id name country_id')
      .limit(limitNum)
      .lean(),

      // 🌍 Tìm countries
      Country.find({ name: searchRegex })
      .select('_id name code')
      .limit(limitNum)
      .lean()
    ]);

    // Format results
    const results = {
      tours: tours.map(tour => ({
        id: tour._id,
        name: tour.name,
        description: tour.description,
        price: tour.adult_price,
        duration: tour.duration_days,
        rating: tour.rating,
        image: Array.isArray(tour.images) ? tour.images[0] : null,
        country: (tour.country_id as any)?.name || '',
        type: 'tour'
      })),
      destinations: destinations.map(dest => ({
        id: dest._id,
        name: dest.name,
        city: dest.city,
        description: dest.description,
        category: dest.category,
        destType: dest.type,
        type: 'destination'
      })),
      provinces: provinces.map(prov => ({
        id: prov._id,
        name: prov.name,
        type: 'province'
      })),
      countries: countries.map(country => ({
        id: country._id,
        name: country.name,
        code: country.code,
        type: 'country'
      }))
    };

    // Tính total results
    const totalResults = tours.length + destinations.length + provinces.length + countries.length;

    return res.json({
      success: true,
      data: results,
      meta: {
        query: searchQuery,
        totalResults,
        breakdown: {
          tours: tours.length,
          destinations: destinations.length,
          provinces: provinces.length,
          countries: countries.length
        }
      }
    });

  } catch (error) {
    console.error('[Smart Search] Error:', error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tìm kiếm",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
