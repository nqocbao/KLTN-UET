import type { Request, Response } from 'express';
import { Transport } from '../../models/transports.model.js';

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
};
