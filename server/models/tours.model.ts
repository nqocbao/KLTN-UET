import mongoose from "mongoose";
import { nanoid } from "nanoid";

// Schema cho lịch trình tour từng ngày
const itineraryDaySchema = new mongoose.Schema({
  day: { type: Number, required: true }, // 0 = đêm đầu, 1 = ngày 1, ...
  title: { type: String, required: true },
  description: { type: String },
  meals: [{ type: String }], // ["Ăn Sáng", "Trưa", "Tối"]
  image: { type: String }
}, { _id: false });

// Schema cho chi tiết dịch vụ bao gồm
const includedServicesDetailSchema = new mongoose.Schema({
  transport: { type: String }, // Vận chuyển
  accommodation: { type: String }, // Lưu trú
  meals: { type: String }, // Ăn uống
  guide: { type: String }, // Hướng dẫn viên
  extras: [{ type: String }] // Các dịch vụ khác
}, { _id: false });

const tourSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    tour_code: { type: String, unique: true }, // Mã tour tự động sinh (VD: "TOUR-abc123XYZ")
    description: { type: String }, // Điểm nổi bật tour (dùng làm highlights)
    country_id: { type: mongoose.Schema.Types.ObjectId, ref: "Country" }, // Quốc gia điểm đến
    guide_id: { type: mongoose.Schema.Types.ObjectId, ref: "Guide" },
    departure_location_id: { type: mongoose.Schema.Types.ObjectId, ref: "Province" }, // Điểm khởi hành (province)
    adult_price: { type: Number },
    child_price: { type: Number },
    duration_days: { type: Number },
    rating: { type: Number, min: 0, max: 5 },
    departure_dates: [{ type: Date }], // Các ngày khởi hành có sẵn
    included_services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }], // Dịch vụ đi kèm (ref)
    
    // Các trường mới cho chi tiết tour
    itinerary: [itineraryDaySchema], // Chương trình tour từng ngày
    included_services_detail: includedServicesDetailSchema, // Giá Tour Bao Gồm
    excluded_services: [{ type: String }], // Giá Tour Không Bao Gồm
    
    images: { type: mongoose.Schema.Types.Mixed }, // JSON
    banner_url: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }, // Trạng thái tour
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: Tự động sinh mã tour nếu chưa có
tourSchema.pre('save', function(next) {
  if (this.isNew && !this.tour_code) {
    // Sinh mã tour với format: TOUR-xxxxxx (6 ký tự random)
    this.tour_code = `${nanoid(6).toUpperCase()}`;
  }
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

export default Tour;
