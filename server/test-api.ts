import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Transport } from './models/transports.model.js';

dotenv.config();

const app = express();

// Test route
app.get('/test-buses', async (req, res) => {
  try {
    console.log('Testing buses query...');
    
    // Test 1: Get all transports
    const allTransports = await Transport.find({});
    console.log(`All transports: ${allTransports.length}`);
    
    // Test 2: Get buses with query object
    const query = { is_active: true, type: 'bus' };
    console.log('Query:', query);
    const buses = await Transport.find(query);
    console.log(`Buses found: ${buses.length}`);
    
    // Test 3: Check req.query
    console.log('req.query:', req.query);
    
    res.json({
      allTransports: allTransports.length,
      buses: buses.length,
      busesData: buses.map(b => ({
        id: b._id,
        service_name: b.service_name,
        type: b.type,
        from: b.departure_location,
        to: b.arrival_location
      }))
    });
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Connect and start
mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(5001, () => {
      console.log('🧪 Test server running on http://localhost:5001');
      console.log('📍 Test endpoint: http://localhost:5001/test-buses');
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });
