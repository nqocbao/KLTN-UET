import type { Request, Response } from "express";
import Hotel from "../../models/hotels.model.js";
import Province from "../../models/provinces.model.js";
import District from "../../models/districts.model.js";
import Ward from "../../models/wards.model.js";
import Address from "../../models/addresses.model.js";
import Destination from "../../models/destinations.model.js";
import Country from "../../models/countries.model.js";
import {
  fetchHotelsAutocompleteFromSerpApi,
  fetchHotelsFromSerpApi,
  type SerpApiHotelAutocompleteSuggestion,
  type SerpApiHotelProperty,
} from "../../services/serpapi.service.js";

function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime());
}

function mapSerpApiHotelToClient(hotel: SerpApiHotelProperty) {
  const image =
    hotel.images?.[0]?.thumbnail || hotel.images?.[0]?.original_image || null;

  const numericPrice =
    hotel.rate_per_night?.extracted_lowest ??
    hotel.total_rate?.extracted_lowest ??
    null;

  const priceText =
    hotel.rate_per_night?.lowest || hotel.total_rate?.lowest || null;

  return {
    name: hotel.name || "N/A",
    image_url: image,
    rating: hotel.overall_rating ?? null,
    price: numericPrice,
    price_text: priceText,
    hotel_class: hotel.extracted_hotel_class ?? null,
    reviews: hotel.reviews ?? 0,
    amenities: Array.isArray(hotel.amenities) ? hotel.amenities.slice(0, 8) : [],
    description: hotel.description || "",
    location: hotel.gps_coordinates || null,
  };
}

function mapSerpApiHotelAutocompleteSuggestionToClient(
  suggestion: SerpApiHotelAutocompleteSuggestion,
  index: number
) {
  const name =
    (suggestion.value as string | undefined)?.trim() ||
    (suggestion.autocomplete_suggestion as string | undefined)?.trim() ||
    "";

  const fallbackId = `${name || "hotel"}-${index}`;

  return {
    id:
      (suggestion.property_token as string | undefined) ||
      (suggestion.kgmid as string | undefined) ||
      (suggestion.data_cid as string | undefined) ||
      fallbackId,
    name,
    type: (suggestion.type as string | undefined) || "accommodation",
    location: (suggestion.location as string | undefined) || null,
    thumbnail: (suggestion.thumbnail as string | undefined) || null,
    highlighted_words: Array.isArray(suggestion.highlighted_words)
      ? suggestion.highlighted_words
      : [],
    autocomplete_suggestion:
      (suggestion.autocomplete_suggestion as string | undefined) || null,
    property_token: (suggestion.property_token as string | undefined) || null,
    serpapi_google_hotels_link:
      (suggestion.serpapi_google_hotels_link as string | undefined) || null,
  };
}

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

export const searchHotelsWithSerpApi = async (req: Request, res: Response) => {
  try {
    const {
      q,
      check_in_date,
      check_out_date,
      gl,
      hl,
      currency,
      adults,
      children,
      children_ages,
    } = req.query as Record<string, string>;

    if (!q || !check_in_date || !check_out_date) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: q, check_in_date, check_out_date",
      });
    }

    if (!isValidDateString(check_in_date) || !isValidDateString(check_out_date)) {
      return res.status(400).json({
        success: false,
        message: "Định dạng ngày không hợp lệ, yêu cầu YYYY-MM-DD",
      });
    }

    if (new Date(check_out_date) <= new Date(check_in_date)) {
      return res.status(400).json({
        success: false,
        message: "check_out_date phải sau check_in_date",
      });
    }

    const normalizedAdults = adults ? Number(adults) : 2;
    const normalizedChildren = children ? Number(children) : 0;

    if (!Number.isInteger(normalizedAdults) || normalizedAdults < 1) {
      return res.status(400).json({
        success: false,
        message: "adults phải là số nguyên >= 1",
      });
    }

    if (!Number.isInteger(normalizedChildren) || normalizedChildren < 0) {
      return res.status(400).json({
        success: false,
        message: "children phải là số nguyên >= 0",
      });
    }

    if (children_ages && normalizedChildren === 0) {
      return res.status(400).json({
        success: false,
        message: "children_ages chỉ hợp lệ khi children > 0",
      });
    }

    if (children_ages) {
      const ages = children_ages.split(",").map((age) => Number(age.trim()));
      if (ages.length !== normalizedChildren || ages.some((age) => !Number.isFinite(age) || age < 1 || age > 17)) {
        return res.status(400).json({
          success: false,
          message: "children_ages phải khớp số children và nằm trong khoảng 1-17",
        });
      }
    }

    const properties = await fetchHotelsFromSerpApi({
      q,
      check_in_date,
      check_out_date,
      adults: normalizedAdults,
      children: normalizedChildren,
      ...(gl ? { gl } : {}),
      ...(hl ? { hl } : {}),
      ...(currency ? { currency } : {}),
      ...(children_ages ? { children_ages } : {}),
    });

    const mapped = properties.map(mapSerpApiHotelToClient);

    return res.json({
      success: true,
      data: mapped,
      total: mapped.length,
      meta: {
        query: q,
        check_in_date,
        check_out_date,
        adults: normalizedAdults,
        children: normalizedChildren,
        source: "serpapi_google_hotels",
      },
    });
  } catch (error: any) {
    console.error("[Hotel Search SerpAPI] Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tìm khách sạn từ SerpAPI",
      error: error.message,
    });
  }
};

export const autocompleteHotelsWithSerpApi = async (
  req: Request,
  res: Response
) => {
  try {
    const { q, gl, hl, currency, limit } = req.query as Record<string, string>;

    const normalizedQuery = (q || "").trim();
    if (normalizedQuery.length < 2) {
      return res.status(400).json({
        success: false,
        message: "q là bắt buộc và cần tối thiểu 2 ký tự",
      });
    }

    const parsedLimit = Number(limit);
    const normalizedLimit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(Math.trunc(parsedLimit), 1), 20)
      : 10;

    const suggestions = await fetchHotelsAutocompleteFromSerpApi({
      q: normalizedQuery,
      ...(gl ? { gl } : {}),
      ...(hl ? { hl } : {}),
      ...(currency ? { currency } : {}),
    });

    const mapped = suggestions
      .map((item, index) => mapSerpApiHotelAutocompleteSuggestionToClient(item, index))
      .filter((item) => Boolean(item.name))
      .slice(0, normalizedLimit);

    return res.status(200).json({
      success: true,
      data: mapped,
      total: mapped.length,
      meta: {
        query: normalizedQuery,
        source: "serpapi_google_hotels_autocomplete",
      },
    });
  } catch (error: any) {
    console.error("[Hotel Autocomplete SerpAPI] Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi gợi ý khách sạn từ SerpAPI",
      error: error.message,
    });
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
