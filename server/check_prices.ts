import mongoose from 'mongoose';
import Hotel from './models/hotels.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    const hotels = await Hotel.find().select('name priceTwoSingleBed');
    const withPrice = hotels.filter(h => h.priceTwoSingleBed !== undefined && h.priceTwoSingleBed !== null).length;
    console.log(`Total hotels: ${hotels.length}`);
    console.log(`Hotels with price: ${withPrice}`);
    if (hotels.length > 0) {
      console.log('Sample prices:', hotels.slice(0, 5).map(h => h.priceTwoSingleBed));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
