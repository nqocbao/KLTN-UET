import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  province_id: { type: mongoose.Schema.Types.ObjectId, ref: "Province" },
  district_id: { type: mongoose.Schema.Types.ObjectId, ref: "District" },
  ward_id: { type: mongoose.Schema.Types.ObjectId, ref: "Ward" },
  address_detail: { type: String, trim: true }, // Số nhà, tên đường
  postal_code: { type: String, trim: true },
  latitude: { type: mongoose.Schema.Types.Decimal128 },
  longitude: { type: mongoose.Schema.Types.Decimal128 },
});

const Address = mongoose.model("Address", addressSchema);

export default Address;
