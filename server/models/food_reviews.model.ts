import { Schema, model, type Document } from "mongoose";

export type FoodReviewPostType =
  | "food_review"
  | "food_recommendation"
  | "food_complaint"
  | "food_warning"
  | "food_promotion";

export type CommentSentimentLabel =
  | "mostly_positive"
  | "mostly_negative"
  | "mixed"
  | "neutral"
  | "insufficient_comment_signal"
  | "not_analyzed";

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
  postType?: FoodReviewPostType | null;
  cleaning?: {
    decision?: "keep" | "reject" | null;
    postType?: FoodReviewPostType | null;
    reasons: string[];
    sourceFile?: string | null;
    rowNumber?: number | null;
    dedupeKey?: string | null;
    contentHash?: string | null;
    signals?: {
      foodSignalCount?: number;
      dishTagCount?: number;
      hasAddress?: boolean;
      hasPrice?: boolean;
      commentsCount?: number;
      engagementScore?: number;
      isStrongOpinion?: boolean;
    };
  };
  commentFetchPlan?: {
    fetchRecommended: boolean;
    priority: number;
    reason?: string | null;
    postUrl?: string | null;
    commentsCount?: number;
    status?: "pending" | "fetched" | "skipped" | "failed";
    fetchedAt?: Date | null;
    apifyRunId?: string | null;
    commentCountFetched?: number;
    error?: string | null;
  };
  commentSentiment?: {
    label: CommentSentimentLabel;
    rawCommentCount?: number;
    spamFilteredCount?: number;
    spamReasons?: Record<string, number>;
    validCommentCount: number;
    positiveCount: number;
    negativeCount: number;
    neutralCount: number;
    mixedCount: number;
    positiveRatio: number;
    negativeRatio: number;
    topPositiveComments: string[];
    topNegativeComments: string[];
    analyzedAt?: Date | null;
    model?: string | null;
  };
  comments?: Array<{
    comment_id?: string | null;
    text: string;
    date?: string | null;
    likesCount?: number;
    profileName?: string | null;
    commentUrl?: string | null;
    sentiment?: string | null;
    isSpam?: boolean;
    spamReason?: string | null;
  }>;
  validComments?: Array<{
    comment_id?: string | null;
    text: string;
    date?: string | null;
    likesCount?: number;
    profileName?: string | null;
    commentUrl?: string | null;
    sentiment?: string | null;
    isSpam?: boolean;
    spamReason?: string | null;
  }>;
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
    postType: {
      type: String,
      enum: [
        "food_review",
        "food_recommendation",
        "food_complaint",
        "food_warning",
        "food_promotion",
      ],
      default: null,
      index: true,
    },
    cleaning: {
      decision: {
        type: String,
        enum: ["keep", "reject", null],
        default: null,
      },
      postType: {
        type: String,
        enum: [
          "food_review",
          "food_recommendation",
          "food_complaint",
          "food_warning",
          "food_promotion",
          null,
        ],
        default: null,
      },
      reasons: {
        type: [String],
        default: [],
      },
      sourceFile: { type: String, default: null, trim: true },
      rowNumber: { type: Number, default: null, min: 0 },
      dedupeKey: { type: String, default: null, trim: true },
      contentHash: { type: String, default: null, trim: true },
      signals: {
        foodSignalCount: { type: Number, default: 0, min: 0 },
        dishTagCount: { type: Number, default: 0, min: 0 },
        hasAddress: { type: Boolean, default: false },
        hasPrice: { type: Boolean, default: false },
        commentsCount: { type: Number, default: 0, min: 0 },
        engagementScore: { type: Number, default: 0, min: 0 },
        isStrongOpinion: { type: Boolean, default: false },
      },
    },
    commentFetchPlan: {
      fetchRecommended: { type: Boolean, default: false },
      priority: { type: Number, default: 0, min: 0 },
      reason: { type: String, default: null, trim: true },
      postUrl: { type: String, default: null, trim: true },
      commentsCount: { type: Number, default: 0, min: 0 },
      status: {
        type: String,
        enum: ["pending", "fetched", "skipped", "failed"],
        default: "pending",
      },
      fetchedAt: { type: Date, default: null },
      apifyRunId: { type: String, default: null, trim: true },
      commentCountFetched: { type: Number, default: 0, min: 0 },
      error: { type: String, default: null, trim: true },
    },
    commentSentiment: {
      label: {
        type: String,
        enum: [
          "mostly_positive",
          "mostly_negative",
          "mixed",
          "neutral",
          "insufficient_comment_signal",
          "not_analyzed",
        ],
        default: "not_analyzed",
      },
      rawCommentCount: { type: Number, default: 0, min: 0 },
      spamFilteredCount: { type: Number, default: 0, min: 0 },
      spamReasons: {
        type: Map,
        of: Number,
        default: {},
      },
      validCommentCount: { type: Number, default: 0, min: 0 },
      positiveCount: { type: Number, default: 0, min: 0 },
      negativeCount: { type: Number, default: 0, min: 0 },
      neutralCount: { type: Number, default: 0, min: 0 },
      mixedCount: { type: Number, default: 0, min: 0 },
      positiveRatio: { type: Number, default: 0, min: 0, max: 1 },
      negativeRatio: { type: Number, default: 0, min: 0, max: 1 },
      topPositiveComments: { type: [String], default: [] },
      topNegativeComments: { type: [String], default: [] },
      analyzedAt: { type: Date, default: null },
      model: { type: String, default: null, trim: true },
    },
    comments: {
      type: [
        {
          comment_id: { type: String, default: null, trim: true },
          text: { type: String, required: true, trim: true },
          date: { type: String, default: null, trim: true },
          likesCount: { type: Number, default: 0, min: 0 },
          profileName: { type: String, default: null, trim: true },
          commentUrl: { type: String, default: null, trim: true },
          sentiment: { type: String, default: null, trim: true },
          isSpam: { type: Boolean, default: false },
          spamReason: { type: String, default: null, trim: true },
        },
      ],
      default: [],
    },
    validComments: {
      type: [
        {
          comment_id: { type: String, default: null, trim: true },
          text: { type: String, required: true, trim: true },
          date: { type: String, default: null, trim: true },
          likesCount: { type: Number, default: 0, min: 0 },
          profileName: { type: String, default: null, trim: true },
          commentUrl: { type: String, default: null, trim: true },
          sentiment: { type: String, default: null, trim: true },
          isSpam: { type: Boolean, default: false },
          spamReason: { type: String, default: null, trim: true },
        },
      ],
      default: [],
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
foodReviewSchema.index({ postType: 1, "engagement.score": -1 });
foodReviewSchema.index({ "commentFetchPlan.fetchRecommended": 1, "commentFetchPlan.priority": 1 });
foodReviewSchema.index({ "commentSentiment.label": 1 });
foodReviewSchema.index({
  title: "text",
  summary: "text",
  content: "text",
  "area.addressText": "text",
});

const FoodReview = model<IFoodReview>("FoodReview", foodReviewSchema);

export default FoodReview;
