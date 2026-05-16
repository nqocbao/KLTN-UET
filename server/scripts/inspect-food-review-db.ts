import dotenv from "dotenv";
import mongoose from "mongoose";
import FoodReview from "../models/food_reviews.model.js";

dotenv.config();

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not defined");
  }

  await mongoose.connect(uri);

  const [count, active, indexes, byCity, byPostType, sample] = await Promise.all([
    FoodReview.countDocuments(),
    FoodReview.countDocuments({ isActive: true }),
    FoodReview.collection.indexes(),
    FoodReview.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$area.city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    FoodReview.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$postType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    FoodReview.findOne({}).select("-rawPayload").lean(),
  ]);

  console.log(
    JSON.stringify(
      {
        collection: FoodReview.collection.name,
        count,
        active,
        indexes: indexes.map((index) => ({
          name: index.name,
          key: index.key,
          unique: Boolean(index.unique),
          sparse: Boolean(index.sparse),
        })),
        byCity,
        byPostType,
        sampleKeys: sample ? Object.keys(sample) : [],
        sample,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error.message || error);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  process.exit(1);
});
