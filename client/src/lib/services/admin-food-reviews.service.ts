import { apiClient } from "@/lib/api-client";
import type { ApiResponse, FoodReview, PaginatedResponse } from "@/types/api";

export interface AdminFoodReviewImportRow {
  row: number;
  status: "valid" | "invalid";
  reason: string | null;
  warnings: string[];
  sourceUrl: string | null;
  title: string | null;
}

export interface AdminFoodReviewWarningCounts {
  missing_posted_at: number;
  missing_images: number;
  missing_price: number;
  missing_phone: number;
  missing_city: number;
  missing_district: number;
  missing_dish_tags: number;
}

export interface AdminFoodReviewPreviewResult {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  warningCounts: AdminFoodReviewWarningCounts;
  previewRows: AdminFoodReviewImportRow[];
}

export interface AdminFoodReviewPreviewSessionInfo {
  sessionId: string;
  expiresAt: string;
}

export interface AdminFoodReviewPreviewPage {
  page: number;
  limit: number;
  statusFilter: "all" | "valid" | "invalid";
  totalRows: number;
  totalPages: number;
  rows: AdminFoodReviewImportRow[];
}

export interface AdminFoodReviewPreviewEditableDraft {
  title: string;
  summary: string;
  content: string;
  area: {
    city: string;
    district: string | null;
    ward: string | null;
    addressText: string | null;
  };
  dishTags: string[];
  hashtags: string[];
  contactPhones: string[];
  priceMin: number | null;
  priceMax: number | null;
  imageUrls: string[];
  postedAt: string | null;
  engagement: {
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    reactionsCount: number;
    score: number;
  };
  source: {
    postUrl: string;
    postLegacyId: string | null;
    groupTitle: string | null;
    groupId: string | null;
    rawInputUrl: string | null;
    authorName: string | null;
    authorId: string | null;
  };
  isActive: boolean;
}

export interface AdminFoodReviewPreviewRowDetail extends AdminFoodReviewImportRow {
  editable: AdminFoodReviewPreviewEditableDraft;
}

export interface AdminFoodReviewPreviewSessionResult {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  warningCounts: AdminFoodReviewWarningCounts;
  session: AdminFoodReviewPreviewSessionInfo;
  previewPage: AdminFoodReviewPreviewPage;
}

export interface AdminFoodReviewPreviewRowResponse {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  warningCounts: AdminFoodReviewWarningCounts;
  session: AdminFoodReviewPreviewSessionInfo;
  row: AdminFoodReviewPreviewRowDetail;
}

export interface AdminFoodReviewCommitResult {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  insertedRecords: number;
  updatedRecords: number;
  failedRecords: number;
  skippedRecords: number;
  warningCounts: AdminFoodReviewWarningCounts;
  invalidRows: AdminFoodReviewImportRow[];
  failedRows: Array<{
    row: number;
    reason: string;
    sourceUrl: string | null;
  }>;
}

interface ImportPayload {
  records: unknown[];
}

interface PreviewPageParams {
  page?: number;
  limit?: number;
  status?: "all" | "valid" | "invalid";
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? U[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

export type AdminFoodReviewPreviewRowPatch = DeepPartial<AdminFoodReviewPreviewEditableDraft>;

export interface AdminFoodReviewUpdatePayload {
  title?: string;
  summary?: string;
  content?: string;
  area?: {
    city?: string;
    district?: string | null;
    ward?: string | null;
    addressText?: string | null;
  };
  dishTags?: string[];
  hashtags?: string[];
  contactPhones?: string[];
  priceMin?: number | null;
  priceMax?: number | null;
  imageUrls?: string[];
  postedAt?: string | null;
  isActive?: boolean;
}

export const adminFoodReviewsApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: "active" | "inactive";
  }) => {
    return apiClient.get<PaginatedResponse<FoodReview>>("/admin/food-reviews", {
      params,
    });
  },

  getById: (id: string) => {
    return apiClient.get<ApiResponse<FoodReview>>(`/admin/food-reviews/${id}`);
  },

  update: (id: string, payload: AdminFoodReviewUpdatePayload) => {
    return apiClient.patch<ApiResponse<FoodReview>>(`/admin/food-reviews/${id}`, payload);
  },

  previewImport: (payload: ImportPayload) => {
    return apiClient.post<{ success: boolean; data: AdminFoodReviewPreviewResult }>(
      "/admin/food-reviews/import/preview",
      payload
    );
  },

  previewImportSession: (payload: ImportPayload, params?: PreviewPageParams) => {
    return apiClient.post<{ success: boolean; data: AdminFoodReviewPreviewSessionResult }>(
      "/admin/food-reviews/import/preview/session",
      payload,
      { params }
    );
  },

  getPreviewSessionPage: (sessionId: string, params?: PreviewPageParams) => {
    return apiClient.get<{ success: boolean; data: AdminFoodReviewPreviewSessionResult }>(
      `/admin/food-reviews/import/preview/session/${sessionId}`,
      { params }
    );
  },

  getPreviewSessionRow: (sessionId: string, rowNumber: number) => {
    return apiClient.get<{ success: boolean; data: AdminFoodReviewPreviewRowResponse }>(
      `/admin/food-reviews/import/preview/session/${sessionId}/row/${rowNumber}`
    );
  },

  updatePreviewSessionRow: (
    sessionId: string,
    rowNumber: number,
    payload: AdminFoodReviewPreviewRowPatch
  ) => {
    return apiClient.patch<{ success: boolean; data: AdminFoodReviewPreviewRowResponse }>(
      `/admin/food-reviews/import/preview/session/${sessionId}/row/${rowNumber}`,
      payload
    );
  },

  commitImport: (payload: ImportPayload) => {
    return apiClient.post<{ success: boolean; data: AdminFoodReviewCommitResult }>(
      "/admin/food-reviews/import/commit",
      payload
    );
  },

  commitImportSession: (sessionId: string) => {
    return apiClient.post<{ success: boolean; data: AdminFoodReviewCommitResult }>(
      `/admin/food-reviews/import/commit/session/${sessionId}`
    );
  },
};
