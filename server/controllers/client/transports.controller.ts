import type { Request, Response } from 'express';
import { Transport } from '../../models/transports.model.js';
import { fetchFlightsFromSerpApi } from '../../services/serpapi.service.js';
import { mapSerpApiResults } from '../../services/serpapi.mapper.js';

export const transportsController = {
  // Get all transports with filters
  async getAll(req: Request, res: Response) {
    try {
      const {
        type, // bus, airport_transfer, taxi, etc.
        from,
        to,
        pickup,
        dropoff,
        date,
        time,
        sortBy = 'price_asc',
        minPrice,
        maxPrice,
        vehicleType,
        limit = 50,
      } = req.query;

      console.log('📝 Query params:', { type, from, to, pickup, dropoff, sortBy });

      // Build query
      const query: any = { is_active: true };

      // Filter by transport type
      if (type) {
        query.type = type;
        console.log('🔍 Filtering by type:', type);
      }

      // Location filters (for buses/trains)
      if (from) {
        query.departure_location = { $regex: from, $options: 'i' };
      }
      if (to) {
        query.arrival_location = { $regex: to, $options: 'i' };
      }

      // Location filters (for airport transfers/taxis)
      if (pickup) {
        query.pickup_location = { $regex: pickup, $options: 'i' };
      }
      if (dropoff) {
        query.dropoff_location = { $regex: dropoff, $options: 'i' };
      }

      // Price range filter
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      // Vehicle type filter
      if (vehicleType) {
        query.vehicle_type = { $regex: vehicleType, $options: 'i' };
      }

      // Build sort
      let sort: any = {};
      switch (sortBy) {
        case 'price_asc':
          sort = { price: 1 };
          break;
        case 'price_desc':
          sort = { price: -1 };
          break;
        case 'rating_high':
          sort = { rating: -1 };
          break;
        case 'departure_early':
          sort = { departure_time: 1 };
          break;
        case 'duration_short':
          sort = { duration: 1 };
          break;
        case 'luxury':
          sort = { price: -1, rating: -1 };
          break;
        default:
          sort = { price: 1 };
      }

      const transports = await Transport.find(query)
        .sort(sort)
        .limit(Number(limit))
        .lean();

      console.log(`✅ Found ${transports.length} transports with query:`, query);

      res.json({
        success: true,
        data: transports,
        total: transports.length,
      });
    } catch (error: any) {
      console.error('Error fetching transports:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách phương tiện',
        error: error.message,
      });
    }
  },

  // Get transport by ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const transport = await Transport.findById(id).lean();

      if (!transport) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phương tiện',
        });
      }

      res.json({
        success: true,
        data: transport,
      });
    } catch (error: any) {
      console.error('Error fetching transport:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin phương tiện',
        error: error.message,
      });
    }
  },

  // Get buses specifically
  async getBuses(req: Request, res: Response) {
    try {
      // Add type filter
      req.query.type = 'bus';
      return await transportsController.getAll(req, res);
    } catch (error: any) {
      console.error('Error in getBuses:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách xe khách',
        error: error.message,
      });
    }
  },

  // Get airport transfers specifically
  async getAirportTransfers(req: Request, res: Response) {
    try {
      // Add type filter
      req.query.type = 'airport_transfer';
      return await transportsController.getAll(req, res);
    } catch (error: any) {
      console.error('Error in getAirportTransfers:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách đưa đón sân bay',
        error: error.message,
      });
    }
  },

  // Get flights specifically
  async getFlights(req: Request, res: Response) {
    try {
      // Add type filter
      req.query.type = 'flight';
      return await transportsController.getAll(req, res);
    } catch (error: any) {
      console.error('Error in getFlights:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách chuyến bay',
        error: error.message,
      });
    }
  },

  /**
   * Search flights with SerpAPI cache strategy
   *
   * 1. Gọi SerpAPI lấy data mới
   * 2. Upsert từng chuyến bay vào DB (cập nhật giá & amenities nếu đã tồn tại)
   * 3. Query lại DB theo (from, to, date) → trả về cho FE
   *
   * Query params:
   *   from       string  IATA code điểm đi   (VD: "SGN")
   *   to         string  IATA code điểm đến (VD: "HAN")
   *   date       string  Ngày bay        (VD: "2026-03-15")
   *   adults     number  Số hành khách (mặc định 1)
   */
  async searchFlights(req: Request, res: Response) {
    const { from, to, date, adults } = req.query as Record<string, string>;

    // --- Validate params ---
    if (!from || !to || !date) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: from, to, date',
      });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Dịnh dạng date không hợp lệ, yêu cầu: YYYY-MM-DD',
      });
    }

    try {
      // --- Bước 1: Gọi SerpAPI ---
      console.log(`✈️  Fetching flights ${from} → ${to} on ${date}...`);
      const rawResults = await fetchFlightsFromSerpApi({
        departure_id: from.toUpperCase(),
        arrival_id: to.toUpperCase(),
        outbound_date: date,
        adults: adults ? Number(adults) : 1,
      });
      console.log(` SerpAPI trả về ${rawResults.length} chuyến bay`);

      // --- Bước 2: Map SerpAPI response → Transport schema ---
      const mappedFlights = mapSerpApiResults(rawResults, date);

      // --- Bước 3: Upsert từng chuyến bay vào DB ---
      const flightDate = new Date(`${date}T00:00:00.000Z`);
      let inserted = 0;
      let updated = 0;

      for (const flight of mappedFlights) {
        // Key dựa trên: hãng bay + route + giờ bay + ngày
        const filter = {
          type: 'flight',
          service_name: flight.service_name,
          departure_location: flight.departure_location,
          arrival_location: flight.arrival_location,
          departure_time: flight.departure_time,
          flight_date: flightDate,
        };

        // Các field được cập nhật (giữ nguyên rating, total_reviews)
        const updateFields = {
          vehicle_type: flight.vehicle_type,
          arrival_time: flight.arrival_time,
          duration: flight.duration,
          price: flight.price,
          stops: flight.stops,
          amenities: flight.amenities,
          image: flight.image,
          fetched_at: flight.fetched_at,
          is_active: true,
        };

        // Các field chỉ set khi insert mới
        const setOnInsert = {
          available_seats: flight.available_seats,
          rating: 0,
          total_reviews: 0,
          features: [],
        };

        const result = await Transport.findOneAndUpdate(
          filter,
          {
            $set: updateFields,
            $setOnInsert: setOnInsert,
          },
          { upsert: true, new: false } // new: false → check xem trước đó có tồn tại không
        );

        if (result === null) {
          inserted++;
        } else {
          updated++;
        }
      }

      console.log(`💾 DB: ${inserted} inserted, ${updated} updated`);

      // --- Bước 4: Query lại DB → trả về cho FE ---
      const dbFlights = await Transport.find({
        type: 'flight',
        departure_location: { $regex: from.toUpperCase(), $options: 'i' },
        arrival_location: { $regex: to.toUpperCase(), $options: 'i' },
        flight_date: flightDate,
        is_active: true,
      })
        .sort({ price: 1 })
        .lean();

      return res.json({
        success: true,
        data: dbFlights,
        total: dbFlights.length,
        meta: {
          inserted,
          updated,
          fetched_from_api: mappedFlights.length,
        },
      });
    } catch (error: any) {
      // Nếu SerpAPI lỗi → fallback về data có sẵn trong DB
      console.error('❌ SerpAPI error, fallback to DB:', error.message);

      const flightDate = new Date(`${date}T00:00:00.000Z`);
      const dbFlights = await Transport.find({
        type: 'flight',
        departure_location: { $regex: from.toUpperCase(), $options: 'i' },
        arrival_location: { $regex: to.toUpperCase(), $options: 'i' },
        flight_date: flightDate,
        is_active: true,
      })
        .sort({ price: 1 })
        .lean();

      return res.json({
        success: true,
        data: dbFlights,
        total: dbFlights.length,
        meta: {
          inserted: 0,
          updated: 0,
          fetched_from_api: 0,
          fallback: true,
          error: error.message,
        },
      });
    }
  },
};
