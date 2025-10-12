import mongoose from "mongoose";

const countrySchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String }, // Mã ISO ví dụ: VN, JP, US
  description: { type: String },
  flag_url: { type: String },
});

const Country = mongoose.model("Country", countrySchema);

export default Country;
