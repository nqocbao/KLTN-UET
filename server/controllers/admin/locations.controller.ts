import type { Request, Response } from "express";
import Province from "../../models/provinces.model.js";
import District from "../../models/districts.model.js";
import Ward from "../../models/wards.model.js";
import Country from "../../models/countries.model.js";
import Destination from "../../models/destinations.model.js";

/**
 * Search across all location types (countries, provinces, districts, wards, destinations)
 * This endpoint allows searching for locations by name
 */
export const searchLocations = async (req: Request, res: Response) => {
  try {
    const { query, limit = 20 } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Query parameter is required"
      });
    }

    const searchLimit = Math.min(parseInt(limit as string) || 20, 50);
    
    // Create case-insensitive regex for search
    const searchRegex = new RegExp(query, 'i');

    // Search in parallel across all location types
    const [countries, provinces, districts, wards, destinations] = await Promise.all([
      Country.find({ name: searchRegex })
        .limit(searchLimit)
        .lean(),
      Province.find({ name: searchRegex })
        .populate('country_id')
        .limit(searchLimit)
        .lean(),
      District.find({ name: searchRegex })
        .populate({
          path: 'province_id',
          populate: { path: 'country_id' }
        })
        .limit(searchLimit)
        .lean(),
      Ward.find({ name: searchRegex })
        .populate({
          path: 'district_id',
          populate: {
            path: 'province_id',
            populate: { path: 'country_id' }
          }
        })
        .limit(searchLimit)
        .lean(),
      Destination.find({ name: searchRegex })
        .populate('country_id')
        .populate({
          path: 'address_id',
          populate: [
            { path: 'province_id' },
            { path: 'district_id' },
            { path: 'ward_id' }
          ]
        })
        .limit(searchLimit)
        .lean()
    ]);

    // Format results with type information
    const results = [
      ...countries.map((c: any) => ({
        _id: c._id,
        name: c.name,
        type: 'country',
        fullName: c.name,
        code: c.code,
        flag: c.flag_url
      })),
      ...provinces.map((p: any) => ({
        _id: p._id,
        name: p.name,
        type: 'province',
        country: p.country_id?.name || '',
        country_id: p.country_id?._id || '',
        fullName: p.name
      })),
      ...districts.map((d: any) => ({
        _id: d._id,
        name: d.name,
        type: 'district',
        province: d.province_id?.name || '',
        province_id: d.province_id?._id || '',
        country: d.province_id?.country_id?.name || '',
        country_id: d.province_id?.country_id?._id || '',
        fullName: `${d.name}, ${d.province_id?.name || ''}`
      })),
      ...wards.map((w: any) => ({
        _id: w._id,
        name: w.name,
        type: 'ward',
        district: w.district_id?.name || '',
        district_id: w.district_id?._id || '',
        province: w.district_id?.province_id?.name || '',
        province_id: w.district_id?.province_id?._id || '',
        country: w.district_id?.province_id?.country_id?.name || '',
        country_id: w.district_id?.province_id?.country_id?._id || '',
        fullName: `${w.name}, ${w.district_id?.name || ''}, ${w.district_id?.province_id?.name || ''}`
      })),
      ...destinations.map((dest: any) => ({
        _id: dest._id,
        name: dest.name,
        type: 'destination',
        country: dest.country_id?.name || '',
        country_id: dest.country_id?._id || '',
        province: dest.address_id?.province_id?.name || '',
        province_id: dest.address_id?.province_id?._id || '',
        district: dest.address_id?.district_id?.name || '',
        district_id: dest.address_id?.district_id?._id || '',
        fullName: dest.name
      }))
    ];

    // Sort by relevance (exact matches first, then by name)
    results.sort((a, b) => {
      const aExact = a.name.toLowerCase() === query.toLowerCase();
      const bExact = b.name.toLowerCase() === query.toLowerCase();
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      return a.name.localeCompare(b.name, 'vi');
    });

    res.status(200).json({
      success: true,
      data: results.slice(0, searchLimit),
      total: results.length
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
