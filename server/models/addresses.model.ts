import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  country_id: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
  province_id: { type: mongoose.Schema.Types.ObjectId, ref: "Province" },
  district_id: { type: mongoose.Schema.Types.ObjectId, ref: "District" },
  ward_id: { type: mongoose.Schema.Types.ObjectId, ref: "Ward" },
  address_detail: { type: String }, // Số nhà, tên đường
  postal_code: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
});

const Address = mongoose.model("Address", addressSchema);

export default Address;
