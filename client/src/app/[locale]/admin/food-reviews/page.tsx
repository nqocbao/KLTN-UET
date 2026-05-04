"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminFoodReviewsApi,
  type AdminFoodReviewCommitResult,
  type AdminFoodReviewImportRow,
  type AdminFoodReviewWarningCounts,
  type AdminFoodReviewPreviewEditableDraft,
  type AdminFoodReviewPreviewPage,
  type AdminFoodReviewPreviewRowDetail,
  type AdminFoodReviewPreviewSessionResult,
  type AdminFoodReviewUpdatePayload,
} from "@/lib/services/admin-food-reviews.service";
import type { FoodReview } from "@/types/api";

const WARNING_LABELS: Record<string, string> = {
  missing_posted_at: "Thiếu thời gian bài viết",
  missing_images: "Thiếu ảnh",
  missing_price: "Thiếu thông tin giá",
  missing_phone: "Thiếu số điện thoại",
  missing_city: "Thiếu tỉnh/thành phố",
  missing_district: "Thiếu quận/huyện",
  missing_dish_tags: "Thiếu tag món ăn",
};

const PREVIEW_PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

function getImportErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object") {
    const response = (error as { response?: { status?: number; data?: { message?: string; error?: string } } }).response;
    const status = response?.status;
    const message = response?.data?.message;
    const errorMessage = response?.data?.error;

    if (status === 401) {
      return "Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập admin. Vui lòng đăng nhập lại.";
    }

    if (status === 403) {
      return "Bạn không có quyền admin để thực hiện import.";
    }

    if (status === 413) {
      return "File import quá lớn. Hãy chia nhỏ dữ liệu hoặc giảm payload trước khi preview/import.";
    }

    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }

    if (typeof errorMessage === "string" && errorMessage.trim().length > 0) {
      return errorMessage;
    }
  }
  return fallback;
}

function compactAttachments(input: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const source = item as Record<string, unknown>;

      const imageValue = source.image;
      let imageUri: string | null = null;
      if (imageValue && typeof imageValue === "object") {
        const image = imageValue as Record<string, unknown>;
        if (typeof image.uri === "string") {
          imageUri = image.uri;
        }
      }

      const thumbnail = typeof source.thumbnail === "string" ? source.thumbnail : null;
      if (!imageUri && !thumbnail) return null;

      const compactItem: Record<string, unknown> = {};
      if (thumbnail) compactItem.thumbnail = thumbnail;
      if (imageUri) compactItem.image = { uri: imageUri };
      return compactItem;
    })
    .filter((item): item is Record<string, unknown> => item !== null);
}

function compactImportRecords(records: unknown[]): unknown[] {
  return records.map((item) => {
    if (!item || typeof item !== "object") return item;

    const source = item as Record<string, unknown>;
    const userValue = source.user;
    const user =
      userValue && typeof userValue === "object"
        ? {
            id: typeof (userValue as Record<string, unknown>).id === "string" ? (userValue as Record<string, unknown>).id : undefined,
            name: typeof (userValue as Record<string, unknown>).name === "string" ? (userValue as Record<string, unknown>).name : undefined,
          }
        : undefined;

    return {
      url: source.url,
      legacyId: source.legacyId,
      text: source.text,
      time: source.time,
      likesCount: source.likesCount,
      commentsCount: source.commentsCount,
      sharesCount: source.sharesCount,
      topReactionsCount: source.topReactionsCount,
      reactionLikeCount: source.reactionLikeCount,
      reactionLoveCount: source.reactionLoveCount,
      groupTitle: source.groupTitle,
      facebookId: source.facebookId,
      inputUrl: source.inputUrl,
      attachments: compactAttachments(source.attachments),
      user,
    };
  });
}

function estimateJsonSizeMb(payload: unknown): number {
  try {
    const json = JSON.stringify(payload);
    return Number((new Blob([json]).size / (1024 * 1024)).toFixed(2));
  } catch {
    return 0;
  }
}

function formatDate(value?: string | null): string {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDateForInput(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseListInput(value: string): string[] {
  return [
    ...new Set(
      value
        .split(/[\n,]/g)
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    ),
  ];
}

function parseNumberField(value: string): number | null | undefined {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return parsed;
}

interface FoodReviewEditForm {
  title: string;
  summary: string;
  content: string;
  city: string;
  district: string;
  ward: string;
  addressText: string;
  dishTags: string;
  hashtags: string;
  contactPhones: string;
  priceMin: string;
  priceMax: string;
  imageUrls: string;
  postedAt: string;
  isActive: boolean;
}

interface PreviewRowEditForm {
  sourceUrl: string;
  title: string;
  summary: string;
  content: string;
  city: string;
  district: string;
  ward: string;
  addressText: string;
  dishTags: string;
  hashtags: string;
  contactPhones: string;
  priceMin: string;
  priceMax: string;
  imageUrls: string;
  postedAt: string;
}

const INITIAL_EDIT_FORM: FoodReviewEditForm = {
  title: "",
  summary: "",
  content: "",
  city: "",
  district: "",
  ward: "",
  addressText: "",
  dishTags: "",
  hashtags: "",
  contactPhones: "",
  priceMin: "",
  priceMax: "",
  imageUrls: "",
  postedAt: "",
  isActive: true,
};

const INITIAL_PREVIEW_EDIT_FORM: PreviewRowEditForm = {
  sourceUrl: "",
  title: "",
  summary: "",
  content: "",
  city: "",
  district: "",
  ward: "",
  addressText: "",
  dishTags: "",
  hashtags: "",
  contactPhones: "",
  priceMin: "",
  priceMax: "",
  imageUrls: "",
  postedAt: "",
};

function toPreviewEditForm(draft: AdminFoodReviewPreviewEditableDraft): PreviewRowEditForm {
  return {
    sourceUrl: draft.source.postUrl || "",
    title: draft.title || "",
    summary: draft.summary || "",
    content: draft.content || "",
    city: draft.area.city || "",
    district: draft.area.district || "",
    ward: draft.area.ward || "",
    addressText: draft.area.addressText || "",
    dishTags: (draft.dishTags || []).join(", "),
    hashtags: (draft.hashtags || []).join(", "),
    contactPhones: (draft.contactPhones || []).join(", "),
    priceMin:
      draft.priceMin === null || draft.priceMin === undefined
        ? ""
        : String(draft.priceMin),
    priceMax:
      draft.priceMax === null || draft.priceMax === undefined
        ? ""
        : String(draft.priceMax),
    imageUrls: (draft.imageUrls || []).join("\n"),
    postedAt: formatDateForInput(draft.postedAt),
  };
}

export default function AdminFoodReviewsPage() {
  const [records, setRecords] = useState<unknown[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [payloadSizeMb, setPayloadSizeMb] = useState<number>(0);
  const [parseError, setParseError] = useState<string | null>(null);

  const [previewLoading, setPreviewLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<AdminFoodReviewPreviewSessionResult | null>(null);
  const [previewSessionId, setPreviewSessionId] = useState<string | null>(null);
  const [commitResult, setCommitResult] = useState<AdminFoodReviewCommitResult | null>(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [previewPageSize, setPreviewPageSize] = useState<(typeof PREVIEW_PAGE_SIZE_OPTIONS)[number]>(25);
  const [invalidPreviewOpen, setInvalidPreviewOpen] = useState(false);
  const [invalidPreviewLoading, setInvalidPreviewLoading] = useState(false);
  const [invalidPreviewPageData, setInvalidPreviewPageData] = useState<AdminFoodReviewPreviewPage | null>(null);

  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [items, setItems] = useState<FoodReview[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FoodReviewEditForm>(INITIAL_EDIT_FORM);

  const [previewEditOpen, setPreviewEditOpen] = useState(false);
  const [previewLoadingRowNumber, setPreviewLoadingRowNumber] = useState<number | null>(
    null
  );
  const [previewEditSaving, setPreviewEditSaving] = useState(false);
  const [previewEditError, setPreviewEditError] = useState<string | null>(null);
  const [previewEditRow, setPreviewEditRow] = useState<AdminFoodReviewPreviewRowDetail | null>(null);
  const [previewEditForm, setPreviewEditForm] = useState<PreviewRowEditForm>(
    INITIAL_PREVIEW_EDIT_FORM
  );

  const canPreview = records.length > 0 && !previewLoading;
  const canImport = !!previewSessionId && !!previewResult && !importLoading;

  const warningSummary = useMemo(() => {
    if (!previewResult) return [];
    return Object.entries(previewResult.warningCounts)
      .filter(([, count]) => count > 0)
      .map(([key, count]) => ({
        label: WARNING_LABELS[key] || key,
        count,
      }));
  }, [previewResult]);

  const previewRows = previewResult?.previewPage.rows || [];
  const previewTotalPages = previewResult?.previewPage.totalPages || 1;
  const previewTotalRows = previewResult?.previewPage.totalRows || 0;
  const invalidPreviewRows = invalidPreviewPageData?.rows || [];
  const invalidPreviewTotalPages = invalidPreviewPageData?.totalPages || 1;

  const applyPreviewSummary = useCallback(
    (summary: {
      totalRecords: number;
      validRecords: number;
      invalidRecords: number;
      warningCounts: AdminFoodReviewWarningCounts;
      session: { sessionId: string; expiresAt: string };
    }) => {
      setPreviewResult((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          totalRecords: summary.totalRecords,
          validRecords: summary.validRecords,
          invalidRecords: summary.invalidRecords,
          warningCounts: summary.warningCounts,
          session: summary.session,
        };
      });
    },
    []
  );

  const previewRangeText = useMemo(() => {
    if (!previewResult || previewTotalRows === 0) return "0-0";
    const currentPage = previewResult.previewPage.page;
    const currentLimit = previewResult.previewPage.limit;
    const start = (currentPage - 1) * currentLimit + 1;
    const end = Math.min(currentPage * currentLimit, previewTotalRows);
    return `${start}-${end}`;
  }, [previewResult, previewTotalRows]);

  const fetchList = useCallback(async () => {
    try {
      setListLoading(true);
      setListError(null);
      const response = await adminFoodReviewsApi.getAll({
        page,
        limit: 10,
        search: search.trim() || undefined,
      });
      if (response.success) {
        setItems(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error) {
      setListError(getImportErrorMessage(error, "Không thể tải danh sách food review"));
    } finally {
      setListLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setParseError(null);
    setPreviewResult(null);
    setPreviewSessionId(null);
    setCommitResult(null);
    setPreviewPage(1);
    setInvalidPreviewOpen(false);
    setInvalidPreviewPageData(null);
    setPreviewEditOpen(false);
    setPreviewEditError(null);
    setPreviewLoadingRowNumber(null);
    setPreviewEditRow(null);
    setPreviewEditForm(INITIAL_PREVIEW_EDIT_FORM);

    if (!file) {
      setRecords([]);
      setFileName("");
      setPayloadSizeMb(0);
      setPreviewSessionId(null);
      return;
    }

    setFileName(file.name);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        setParseError("File JSON phải là mảng dữ liệu (array)");
        setRecords([]);
        setPayloadSizeMb(0);
        return;
      }

      const compacted = compactImportRecords(parsed);
      setRecords(compacted);
      setPayloadSizeMb(estimateJsonSizeMb(compacted));
    } catch {
      setParseError("File JSON không hợp lệ hoặc không đọc được");
      setRecords([]);
      setPayloadSizeMb(0);
    }
  };

  const handlePreview = async () => {
    if (!records.length) return;

    try {
      setPreviewLoading(true);
      setParseError(null);
      setCommitResult(null);
      setInvalidPreviewOpen(false);
      setInvalidPreviewPageData(null);
      const response = await adminFoodReviewsApi.previewImportSession(
        { records },
        { page: 1, limit: previewPageSize, status: "valid" }
      );
      if (response.success) {
        setPreviewResult(response.data);
        setPreviewSessionId(response.data.session.sessionId);
        setPreviewPage(response.data.previewPage.page);
      }
    } catch (error) {
      setPreviewSessionId(null);
      setParseError(getImportErrorMessage(error, "Không thể preview dữ liệu import"));
    } finally {
      setPreviewLoading(false);
    }
  };

  const fetchPreviewSessionPage = async (
    targetSessionId: string,
    targetPage: number,
    targetPageSize: (typeof PREVIEW_PAGE_SIZE_OPTIONS)[number],
    status: "all" | "valid" | "invalid" = "valid"
  ) => {
    try {
      if (status === "invalid") {
        setInvalidPreviewLoading(true);
      } else {
        setPreviewLoading(true);
      }
      setParseError(null);

      const response = await adminFoodReviewsApi.getPreviewSessionPage(targetSessionId, {
        page: targetPage,
        limit: targetPageSize,
        status,
      });

      if (response.success) {
        if (status === "invalid") {
          setInvalidPreviewPageData(response.data.previewPage);
          applyPreviewSummary(response.data);
        } else {
          setPreviewResult(response.data);
          setPreviewPage(response.data.previewPage.page);
        }
      }
    } catch (error) {
      setParseError(getImportErrorMessage(error, "Không thể tải trang preview"));
    } finally {
      if (status === "invalid") {
        setInvalidPreviewLoading(false);
      } else {
        setPreviewLoading(false);
      }
    }
  };

  const handleOpenInvalidPreview = async () => {
    if (!previewSessionId) return;
    setInvalidPreviewOpen(true);
    await fetchPreviewSessionPage(previewSessionId, 1, previewPageSize, "invalid");
  };

  const handleCloseInvalidPreview = () => {
    setInvalidPreviewOpen(false);
  };

  const handleOpenPreviewRowEdit = async (rowNumber: number) => {
    if (!previewSessionId) return;

    try {
      setPreviewLoadingRowNumber(rowNumber);
      setPreviewEditError(null);

      const response = await adminFoodReviewsApi.getPreviewSessionRow(previewSessionId, rowNumber);
      if (response.success) {
        applyPreviewSummary(response.data);
        setPreviewEditRow(response.data.row);
        setPreviewEditForm(toPreviewEditForm(response.data.row.editable));
        setPreviewEditOpen(true);
      }
    } catch (error) {
      setPreviewEditError(getImportErrorMessage(error, "Không thể tải dữ liệu row preview để chỉnh sửa"));
    } finally {
      setPreviewLoadingRowNumber(null);
    }
  };

  const handleClosePreviewEdit = () => {
    if (previewEditSaving) return;
    setPreviewEditOpen(false);
    setPreviewEditError(null);
    setPreviewEditRow(null);
    setPreviewEditForm(INITIAL_PREVIEW_EDIT_FORM);
  };

  const setPreviewEditText = (field: keyof PreviewRowEditForm, value: string) => {
    setPreviewEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSavePreviewEdit = async () => {
    if (!previewSessionId || !previewEditRow) return;

    const sourceUrl = previewEditForm.sourceUrl.trim();
    const title = previewEditForm.title.trim();
    const summary = previewEditForm.summary.trim();
    const content = previewEditForm.content.trim();
    const city = previewEditForm.city.trim();

    if (!sourceUrl || !title || !summary || !content) {
      setPreviewEditError("sourceUrl, title, summary và content là bắt buộc");
      return;
    }

    if (!city) {
      setPreviewEditError("area.city (tỉnh/thành phố) là bắt buộc");
      return;
    }

    const priceMin = parseNumberField(previewEditForm.priceMin);
    const priceMax = parseNumberField(previewEditForm.priceMax);

    if (priceMin === undefined || priceMax === undefined) {
      setPreviewEditError("priceMin/priceMax phải là số >= 0 hoặc để trống");
      return;
    }

    if (priceMin !== null && priceMax !== null && priceMin > priceMax) {
      setPreviewEditError("priceMin không được lớn hơn priceMax");
      return;
    }

    try {
      setPreviewEditSaving(true);
      setPreviewEditError(null);

      const response = await adminFoodReviewsApi.updatePreviewSessionRow(
        previewSessionId,
        previewEditRow.row,
        {
          source: {
            postUrl: sourceUrl,
          },
          title,
          summary,
          content,
          area: {
            city,
            district: previewEditForm.district.trim() || null,
            ward: previewEditForm.ward.trim() || null,
            addressText: previewEditForm.addressText.trim() || null,
          },
          dishTags: parseListInput(previewEditForm.dishTags),
          hashtags: parseListInput(previewEditForm.hashtags),
          contactPhones: parseListInput(previewEditForm.contactPhones),
          priceMin,
          priceMax,
          imageUrls: parseListInput(previewEditForm.imageUrls),
          postedAt: previewEditForm.postedAt || null,
        }
      );

      if (response.success) {
        applyPreviewSummary(response.data);
        handleClosePreviewEdit();

        await fetchPreviewSessionPage(previewSessionId, previewPage, previewPageSize, "valid");

        if (invalidPreviewOpen) {
          const currentInvalidPage = invalidPreviewPageData?.page || 1;
          await fetchPreviewSessionPage(
            previewSessionId,
            currentInvalidPage,
            previewPageSize,
            "invalid"
          );
        }
      }
    } catch (error) {
      setPreviewEditError(getImportErrorMessage(error, "Không thể cập nhật row preview"));
    } finally {
      setPreviewEditSaving(false);
    }
  };

  const handleImport = async () => {
    if (!previewSessionId || !previewResult) {
      setParseError("Preview session đã hết hạn. Vui lòng preview lại file trước khi import.");
      return;
    }

    try {
      setImportLoading(true);
      setParseError(null);
      const response = await adminFoodReviewsApi.commitImportSession(previewSessionId);
      if (response.success) {
        setCommitResult(response.data);
        setPreviewSessionId(null);
        setInvalidPreviewOpen(false);
        setInvalidPreviewPageData(null);
        setPreviewEditOpen(false);
        setPreviewLoadingRowNumber(null);
        setPreviewEditRow(null);
        fetchList();
      }
    } catch (error) {
      setParseError(getImportErrorMessage(error, "Import dữ liệu thất bại"));
    } finally {
      setImportLoading(false);
    }
  };

  const handleOpenEdit = async (id: string) => {
    try {
      setEditLoading(true);
      setLoadingEditId(id);
      setEditError(null);

      const response = await adminFoodReviewsApi.getById(id);
      if (response.success && response.data) {
        const item = response.data;
        setEditingId(item._id);
        setEditForm({
          title: item.title || "",
          summary: item.summary || "",
          content: item.content || "",
          city: item.area?.city || "",
          district: item.area?.district || "",
          ward: item.area?.ward || "",
          addressText: item.area?.addressText || "",
          dishTags: (item.dishTags || []).join(", "),
          hashtags: (item.hashtags || []).join(", "),
          contactPhones: (item.contactPhones || []).join(", "),
          priceMin:
            item.priceMin === null || item.priceMin === undefined
              ? ""
              : String(item.priceMin),
          priceMax:
            item.priceMax === null || item.priceMax === undefined
              ? ""
              : String(item.priceMax),
          imageUrls: (item.imageUrls || []).join("\n"),
          postedAt: formatDateForInput(item.postedAt),
          isActive: item.isActive !== false,
        });
        setEditOpen(true);
      }
    } catch (error) {
      setEditError(getImportErrorMessage(error, "Không thể tải dữ liệu food review để chỉnh sửa"));
    } finally {
      setEditLoading(false);
      setLoadingEditId(null);
    }
  };

  const handleCloseEdit = () => {
    if (editSaving) return;
    setEditOpen(false);
    setEditingId(null);
    setEditError(null);
    setEditForm(INITIAL_EDIT_FORM);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    const title = editForm.title.trim();
    const summary = editForm.summary.trim();
    const content = editForm.content.trim();
    const city = editForm.city.trim();

    if (!title || !summary || !content) {
      setEditError("Title, summary và content là bắt buộc");
      return;
    }

    if (!city) {
      setEditError("area.city (tỉnh/thành phố) là bắt buộc");
      return;
    }

    const priceMin = parseNumberField(editForm.priceMin);
    const priceMax = parseNumberField(editForm.priceMax);

    if (priceMin === undefined || priceMax === undefined) {
      setEditError("priceMin/priceMax phải là số >= 0 hoặc để trống");
      return;
    }

    if (priceMin !== null && priceMax !== null && priceMin > priceMax) {
      setEditError("priceMin không được lớn hơn priceMax");
      return;
    }

    const payload: AdminFoodReviewUpdatePayload = {
      title,
      summary,
      content,
      area: {
        city,
        district: editForm.district.trim() || null,
        ward: editForm.ward.trim() || null,
        addressText: editForm.addressText.trim() || null,
      },
      dishTags: parseListInput(editForm.dishTags),
      hashtags: parseListInput(editForm.hashtags).map((tag) =>
        tag.replace(/^#/, "").toLowerCase()
      ),
      contactPhones: parseListInput(editForm.contactPhones),
      priceMin,
      priceMax,
      imageUrls: parseListInput(editForm.imageUrls),
      postedAt: editForm.postedAt || null,
      isActive: editForm.isActive,
    };

    try {
      setEditSaving(true);
      setEditError(null);

      const response = await adminFoodReviewsApi.update(editingId, payload);
      if (response.success && response.data) {
        setItems((prev) =>
          prev.map((item) => (item._id === response.data._id ? response.data : item))
        );
        handleCloseEdit();
        fetchList();
      }
    } catch (error) {
      setEditError(getImportErrorMessage(error, "Không thể cập nhật food review"));
    } finally {
      setEditSaving(false);
    }
  };

  const setEditText = (field: keyof Omit<FoodReviewEditForm, "isActive">, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Quản lý Food Review
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Phase 1: Upload JSON, preview chất lượng dữ liệu và import vào MongoDB.
        </p>
      </div>

      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <input
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700 dark:text-gray-200"
          />
          <button
            onClick={handlePreview}
            disabled={!canPreview}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {previewLoading ? "Đang preview..." : "Preview dữ liệu"}
          </button>
          <button
            onClick={handleImport}
            disabled={!canImport}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importLoading ? "Đang import..." : "Import vào DB"}
          </button>
        </div>

        {fileName && (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            File: <span className="font-semibold">{fileName}</span> | Records: <span className="font-semibold">{records.length}</span> | Payload: <span className="font-semibold">{payloadSizeMb} MB</span>
          </div>
        )}

        {parseError && (
          <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {parseError}
          </div>
        )}

        {previewResult && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-gray-500">Tổng records</p>
              <p className="text-xl font-bold">{previewResult.totalRecords}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-gray-500">Hợp lệ</p>
              <p className="text-xl font-bold text-green-600">{previewResult.validRecords}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-gray-500">Không hợp lệ</p>
              <p className="text-xl font-bold text-red-600">{previewResult.invalidRecords}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-gray-500">Có cảnh báo</p>
              <p className="text-xl font-bold text-yellow-600">{warningSummary.reduce((acc, item) => acc + item.count, 0)}</p>
            </div>
          </div>
        )}

        {previewResult?.session && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Preview session: <span className="font-semibold">{previewResult.session.sessionId}</span> | Hết hạn lúc: <span className="font-semibold">{new Date(previewResult.session.expiresAt).toLocaleString("vi-VN")}</span>
          </div>
        )}

        {previewResult && previewSessionId && (
          <div>
            <button
              onClick={handleOpenInvalidPreview}
              disabled={previewResult.invalidRecords <= 0 || invalidPreviewLoading}
              className="px-4 py-2 rounded-lg border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {invalidPreviewLoading
                ? "Đang tải dữ liệu lỗi..."
                : `Xem dữ liệu lỗi (${previewResult.invalidRecords})`}
            </button>
          </div>
        )}

        {warningSummary.length > 0 && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
            <p className="font-semibold text-yellow-800 mb-2">Cảnh báo dữ liệu thiếu:</p>
            <div className="flex flex-wrap gap-2">
              {warningSummary.map((warning) => (
                <span key={warning.label} className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300">
                  {warning.label}: {warning.count}
                </span>
              ))}
            </div>
          </div>
        )}

        {commitResult && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            <p className="font-semibold mb-1">Import hoàn tất</p>
            <p>
              Inserted: {commitResult.insertedRecords} | Updated: {commitResult.updatedRecords} | Skipped: {commitResult.skippedRecords} | Failed: {commitResult.failedRecords}
            </p>
          </div>
        )}
      </section>

      {previewRows.length ? (
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Preview rows hợp lệ</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Hiển thị {previewRangeText} / {previewTotalRows} dòng
              </span>
              <label className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                Dòng/trang
                <select
                  value={previewPageSize}
                  onChange={async (event) => {
                    const nextPageSize = Number(event.target.value) as (typeof PREVIEW_PAGE_SIZE_OPTIONS)[number];
                    setPreviewPageSize(nextPageSize);
                    setPreviewPage(1);

                    if (previewSessionId) {
                      await fetchPreviewSessionPage(previewSessionId, 1, nextPageSize, "valid");
                    }
                  }}
                  className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-700 dark:text-gray-200"
                >
                  {PREVIEW_PAGE_SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-2 text-left">Row</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Reason</th>
                  <th className="px-4 py-2 text-left">Warnings</th>
                  <th className="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row: AdminFoodReviewImportRow) => (
                  <tr key={row.row} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-2">{row.row}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === "valid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 max-w-[320px] truncate">{row.title || "--"}</td>
                    <td className="px-4 py-2 text-red-600">{row.reason || "--"}</td>
                    <td className="px-4 py-2">
                      {row.warnings.length ? row.warnings.map((warning) => WARNING_LABELS[warning] || warning).join(", ") : "--"}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleOpenPreviewRowEdit(row.row)}
                        disabled={previewLoadingRowNumber === row.row}
                        className="px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {previewLoadingRowNumber === row.row ? "Đang mở..." : "Sửa"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Trang {previewPage}/{previewTotalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (!previewSessionId || previewPage <= 1 || previewLoading) return;
                  await fetchPreviewSessionPage(previewSessionId, previewPage - 1, previewPageSize, "valid");
                }}
                disabled={previewPage <= 1 || !previewSessionId || previewLoading}
                className="px-3 py-1.5 border rounded disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={async () => {
                  if (!previewSessionId || previewPage >= previewTotalPages || previewLoading) return;
                  await fetchPreviewSessionPage(previewSessionId, previewPage + 1, previewPageSize, "valid");
                }}
                disabled={previewPage >= previewTotalPages || !previewSessionId || previewLoading}
                className="px-3 py-1.5 border rounded disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Danh sách Food Review hiện tại</h2>
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo title/summary..."
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
            />
            <button
              onClick={fetchList}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {listLoading ? (
          <div className="p-6 text-sm text-gray-500">Đang tải dữ liệu...</div>
        ) : listError ? (
          <div className="p-6 text-sm text-red-600">{listError}</div>
        ) : (
          <>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">District</th>
                    <th className="px-4 py-2 text-left">Likes</th>
                    <th className="px-4 py-2 text-left">Posted</th>
                    <th className="px-4 py-2 text-left">Source</th>
                    <th className="px-4 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="px-4 py-2 max-w-[420px] truncate">{item.title}</td>
                      <td className="px-4 py-2">{item.area?.district || "--"}</td>
                      <td className="px-4 py-2">{item.engagement?.likesCount || 0}</td>
                      <td className="px-4 py-2">{formatDate(item.postedAt)}</td>
                      <td className="px-4 py-2">
                        <a href={item.source?.postUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          Link
                        </a>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleOpenEdit(item._id)}
                          disabled={editLoading}
                          className="px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {loadingEditId === item._id ? "Đang tải..." : "Sửa"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-sm text-gray-500">Trang {page}/{totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 border rounded disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 border rounded disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {invalidPreviewOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 p-4">
          <div className="mx-auto mt-6 w-full max-w-6xl rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Dữ liệu lỗi trong preview
              </h3>
              <button
                onClick={handleCloseInvalidPreview}
                className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600"
              >
                Đóng
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              {invalidPreviewLoading ? (
                <div className="p-6 text-sm text-gray-500">Đang tải dữ liệu lỗi...</div>
              ) : invalidPreviewRows.length ? (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">Row</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Title</th>
                      <th className="px-4 py-2 text-left">Reason</th>
                      <th className="px-4 py-2 text-left">Warnings</th>
                      <th className="px-4 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invalidPreviewRows.map((row) => (
                      <tr key={row.row} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="px-4 py-2">{row.row}</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 max-w-[320px] truncate">{row.title || "--"}</td>
                        <td className="px-4 py-2 text-red-600">{row.reason || "--"}</td>
                        <td className="px-4 py-2">
                          {row.warnings.length
                            ? row.warnings.map((warning) => WARNING_LABELS[warning] || warning).join(", ")
                            : "--"}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleOpenPreviewRowEdit(row.row)}
                            disabled={previewLoadingRowNumber === row.row}
                            className="px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {previewLoadingRowNumber === row.row ? "Đang mở..." : "Sửa"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-sm text-gray-500">Không có dữ liệu lỗi trong trang hiện tại.</div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Trang {invalidPreviewPageData?.page || 1}/{invalidPreviewTotalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (!previewSessionId || !invalidPreviewPageData || invalidPreviewPageData.page <= 1) return;
                    await fetchPreviewSessionPage(
                      previewSessionId,
                      invalidPreviewPageData.page - 1,
                      previewPageSize,
                      "invalid"
                    );
                  }}
                  disabled={
                    !previewSessionId ||
                    !invalidPreviewPageData ||
                    invalidPreviewPageData.page <= 1 ||
                    invalidPreviewLoading
                  }
                  className="px-3 py-1.5 border rounded disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  onClick={async () => {
                    if (
                      !previewSessionId ||
                      !invalidPreviewPageData ||
                      invalidPreviewPageData.page >= invalidPreviewTotalPages
                    ) {
                      return;
                    }
                    await fetchPreviewSessionPage(
                      previewSessionId,
                      invalidPreviewPageData.page + 1,
                      previewPageSize,
                      "invalid"
                    );
                  }}
                  disabled={
                    !previewSessionId ||
                    !invalidPreviewPageData ||
                    invalidPreviewPageData.page >= invalidPreviewTotalPages ||
                    invalidPreviewLoading
                  }
                  className="px-3 py-1.5 border rounded disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px] p-4">
          <div className="mx-auto mt-4 w-full max-w-4xl rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Chỉnh sửa Row Preview #{previewEditRow?.row}
              </h3>
              <button
                onClick={handleClosePreviewEdit}
                disabled={previewEditSaving}
                className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600"
              >
                Đóng
              </button>
            </div>

            <div className="p-6 space-y-4">
              {previewEditError && (
                <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                  {previewEditError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <label className="space-y-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Source URL</span>
                  <input
                    value={previewEditForm.sourceUrl}
                    onChange={(e) => setPreviewEditText("sourceUrl", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</span>
                  <input
                    value={previewEditForm.title}
                    onChange={(e) => setPreviewEditText("title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Summary</span>
                  <textarea
                    value={previewEditForm.summary}
                    onChange={(e) => setPreviewEditText("summary", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Content</span>
                  <textarea
                    value={previewEditForm.content}
                    onChange={(e) => setPreviewEditText("content", e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                  />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">City</span>
                    <input
                      value={previewEditForm.city}
                      onChange={(e) => setPreviewEditText("city", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">District</span>
                    <input
                      value={previewEditForm.district}
                      onChange={(e) => setPreviewEditText("district", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ward</span>
                    <input
                      value={previewEditForm.ward}
                      onChange={(e) => setPreviewEditText("ward", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Address Text</span>
                    <input
                      value={previewEditForm.addressText}
                      onChange={(e) => setPreviewEditText("addressText", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dish Tags (phân tách bằng dấu phẩy)</span>
                    <input
                      value={previewEditForm.dishTags}
                      onChange={(e) => setPreviewEditText("dishTags", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hashtags (phân tách bằng dấu phẩy)</span>
                    <input
                      value={previewEditForm.hashtags}
                      onChange={(e) => setPreviewEditText("hashtags", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Số điện thoại (phân tách bằng dấu phẩy)</span>
                    <input
                      value={previewEditForm.contactPhones}
                      onChange={(e) => setPreviewEditText("contactPhones", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ngày đăng</span>
                    <input
                      type="date"
                      value={previewEditForm.postedAt}
                      onChange={(e) => setPreviewEditText("postedAt", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Price Min (VND)</span>
                    <input
                      value={previewEditForm.priceMin}
                      onChange={(e) => setPreviewEditText("priceMin", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Price Max (VND)</span>
                    <input
                      value={previewEditForm.priceMax}
                      onChange={(e) => setPreviewEditText("priceMax", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                  </label>
                </div>

                <label className="space-y-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Image URLs (mỗi dòng một URL)</span>
                  <textarea
                    value={previewEditForm.imageUrls}
                    onChange={(e) => setPreviewEditText("imageUrls", e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                  />
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button
                onClick={handleClosePreviewEdit}
                disabled={previewEditSaving}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700"
              >
                Huỷ
              </button>
              <button
                onClick={handleSavePreviewEdit}
                disabled={previewEditSaving}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {previewEditSaving ? "Đang lưu..." : "Lưu và re-validate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px] p-4">
          <div className="mx-auto mt-4 w-full max-w-4xl rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Chỉnh sửa Food Review
              </h3>
              <button
                onClick={handleCloseEdit}
                disabled={editSaving}
                className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600"
              >
                Đóng
              </button>
            </div>

            <div className="p-6 space-y-4">
              {editError && (
                <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                  {editError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <label className="space-y-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</span>
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditText("title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Summary</span>
                  <textarea
                    value={editForm.summary}
                    onChange={(e) => setEditText("summary", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Content</span>
                  <textarea
                    value={editForm.content}
                    onChange={(e) => setEditText("content", e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                  />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">City</span>
                    <input
                      value={editForm.city}
                      onChange={(e) => setEditText("city", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">District</span>
                    <input
                      value={editForm.district}
                      onChange={(e) => setEditText("district", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ward</span>
                    <input
                      value={editForm.ward}
                      onChange={(e) => setEditText("ward", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Address Text</span>
                    <input
                      value={editForm.addressText}
                      onChange={(e) => setEditText("addressText", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dish Tags (phân tách bằng dấu phẩy)</span>
                    <input
                      value={editForm.dishTags}
                      onChange={(e) => setEditText("dishTags", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hashtags (phân tách bằng dấu phẩy)</span>
                    <input
                      value={editForm.hashtags}
                      onChange={(e) => setEditText("hashtags", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Số điện thoại (phân tách bằng dấu phẩy)</span>
                    <input
                      value={editForm.contactPhones}
                      onChange={(e) => setEditText("contactPhones", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ngày đăng</span>
                    <input
                      type="date"
                      value={editForm.postedAt}
                      onChange={(e) => setEditText("postedAt", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Price Min (VND)</span>
                    <input
                      value={editForm.priceMin}
                      onChange={(e) => setEditText("priceMin", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Price Max (VND)</span>
                    <input
                      value={editForm.priceMax}
                      onChange={(e) => setEditText("priceMax", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                  </label>
                </div>

                <label className="space-y-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Image URLs (mỗi dòng một URL)</span>
                  <textarea
                    value={editForm.imageUrls}
                    onChange={(e) => setEditText("imageUrls", e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                  />
                </label>

                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Kích hoạt bản ghi</span>
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button
                onClick={handleCloseEdit}
                disabled={editSaving}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700"
              >
                Huỷ
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editSaving}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {editSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
