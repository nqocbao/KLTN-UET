import { Schema, model, type Document } from "mongoose";

export interface IFoodReview extends Document {
  title: string;
  summary: string;
  content: string;
  area: {
    city: string;
    district?: string | null;
    ward?: string | null;
    addressText?: string | null;
  };
  dishTags: string[];
  hashtags: string[];
  contactPhones: string[];
  priceMin?: number | null;
  priceMax?: number | null;
  imageUrls: string[];
  postedAt?: Date | null;
  engagement: {
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    reactionsCount: number;
    score: number;
  };
  source: {
    platform: "facebook";
    groupTitle?: string | null;
    groupId?: string | null;
    postUrl: string;
    postLegacyId?: string | null;
    rawInputUrl?: string | null;
    authorName?: string | null;
    authorId?: string | null;
  };
  isActive: boolean;
  rawPayload?: unknown;
  created_at?: Date;
  updated_at?: Date;
}

const foodReviewSchema = new Schema<IFoodReview>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 420,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      city: { type: String, required: true, default: "Chưa xác định", trim: true },
      district: { type: String, default: null, trim: true },
      ward: { type: String, default: null, trim: true },
      addressText: { type: String, default: null, trim: true },
    },
    dishTags: {
      type: [String],
      default: [],
    },
    hashtags: {
      type: [String],
      default: [],
    },
    contactPhones: {
      type: [String],
      default: [],
    },
    priceMin: {
      type: Number,
      default: null,
      min: 0,
    },
    priceMax: {
      type: Number,
      default: null,
      min: 0,
    },
    imageUrls: {
      type: [String],
      default: [],
    },
    postedAt: {
      type: Date,
      default: null,
    },
    engagement: {
      likesCount: { type: Number, default: 0, min: 0 },
      commentsCount: { type: Number, default: 0, min: 0 },
      sharesCount: { type: Number, default: 0, min: 0 },
      reactionsCount: { type: Number, default: 0, min: 0 },
      score: { type: Number, default: 0, min: 0 },
    },
    source: {
      platform: {
        type: String,
        enum: ["facebook"],
        required: true,
        default: "facebook",
      },
      groupTitle: { type: String, default: null, trim: true },
      groupId: { type: String, default: null, trim: true },
      postUrl: { type: String, required: true, trim: true },
      postLegacyId: { type: String, default: null, trim: true },
      rawInputUrl: { type: String, default: null, trim: true },
      authorName: { type: String, default: null, trim: true },
      authorId: { type: String, default: null, trim: true },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    rawPayload: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

foodReviewSchema.index({ "source.postUrl": 1 }, { unique: true });
foodReviewSchema.index({ "source.postLegacyId": 1 }, { unique: true, sparse: true });
foodReviewSchema.index({ "area.city": 1, "area.district": 1, postedAt: -1 });
foodReviewSchema.index({ "engagement.score": -1, postedAt: -1 });
foodReviewSchema.index({ dishTags: 1 });
foodReviewSchema.index({ hashtags: 1 });
foodReviewSchema.index({
  title: "text",
  summary: "text",
  content: "text",
  "area.addressText": "text",
});

const FoodReview = model<IFoodReview>("FoodReview", foodReviewSchema);

export default FoodReview;
