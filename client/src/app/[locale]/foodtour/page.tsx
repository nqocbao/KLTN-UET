"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  Calendar,
  Flame,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Share2,
  Tag,
  ThumbsDown,
  X,
} from "lucide-react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { foodReviewsApi } from "@/lib/services";
import type { FoodReview, FoodReviewArea } from "@/types/api";
import type {
  FoodReviewEnrichedDetail,
  FoodReviewSortMode,
} from "@/lib/services/food-reviews.service";

function formatDate(dateInput?: string | null): string {
  if (!dateInput) {
    return "Không rõ thời gian";
  }

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return "Không rõ thời gian";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatPrice(min?: number | null, max?: number | null): string {
  if (!min && !max) {
    return "Đang cập nhật";
  }

  if (min && max && min !== max) {
    return `${Math.round(min / 1000)}k - ${Math.round(max / 1000)}k`;
  }

  const value = min || max;
  if (!value) {
    return "Đang cập nhật";
  }

  return `${Math.round(value / 1000)}k`;
}

function buildMapEmbedUrl(input: {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
}): string | null {
  if (input.latitude !== null && input.longitude !== null) {
    const query = `${input.latitude},${input.longitude}`;
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
  }

  if (input.address) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(input.address)}&z=15&output=embed`;
  }

  return null;
}

export default function FoodTourPage() {
  const [reviews, setReviews] = useState<FoodReview[]>([]);
  const [trending, setTrending] = useState<FoodReview[]>([]);
  const [areas, setAreas] = useState<FoodReviewArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [sortBy, setSortBy] = useState<FoodReviewSortMode>("hot");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<FoodReview | null>(null);
  const [enrichedDetail, setEnrichedDetail] = useState<FoodReviewEnrichedDetail | null>(
    null
  );

  const selectedCityArea =
    selectedCity === "all"
      ? null
      : areas.find((item) => item.city === selectedCity) || null;

  const fetchDiscovery = useCallback(async () => {
    try {
      const [areasRes, trendingRes] = await Promise.all([
        foodReviewsApi.getAreas(),
        foodReviewsApi.getTrending(6),
      ]);

      if (areasRes.success) {
        setAreas(areasRes.data || []);
      }

      if (trendingRes.success) {
        setTrending(trendingRes.data || []);
      }
    } catch (e) {
      console.error("[foodtour] discovery fetch error", e);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const areaFilter =
        selectedDistrict !== "all"
          ? selectedDistrict
          : selectedCity !== "all"
            ? selectedCity
            : undefined;

      const response = await foodReviewsApi.getAll({
        page,
        limit: 12,
        sortBy,
        area: areaFilter,
        search: searchKeyword || undefined,
      });

      if (response.success) {
        setReviews(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (e) {
      console.error("[foodtour] list fetch error", e);
      setError("Không thể tải danh sách food review. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [page, searchKeyword, selectedCity, selectedDistrict, sortBy]);

  useEffect(() => {
    fetchDiscovery();
  }, [fetchDiscovery]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const applySearch = () => {
    setPage(1);
    setSearchKeyword(searchInput.trim());
  };

  const openReviewDetail = async (review: FoodReview) => {
    setSelectedReview(review);
    setDetailOpen(true);
    setDetailError(null);
    setEnrichedDetail(null);

    try {
      setDetailLoading(true);
      const response = await foodReviewsApi.getEnrichedDetail(review._id);
      if (response.success && response.data) {
        setEnrichedDetail(response.data);
      }
    } catch (e) {
      console.error("[foodtour] getEnrichedDetail error", e);
      setDetailError("Không thể tải dữ liệu mở rộng từ Apify. Đang hiển thị dữ liệu cơ bản.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeReviewDetail = () => {
    setDetailOpen(false);
    setDetailLoading(false);
    setDetailError(null);
    setSelectedReview(null);
    setEnrichedDetail(null);
  };

  const popupReview = enrichedDetail?.review || selectedReview;
  const popupSocial = enrichedDetail?.insights.social;
  const popupLocation = enrichedDetail?.insights.location;
  const popupMapUrl = buildMapEmbedUrl({
    latitude: popupLocation?.latitude ?? null,
    longitude: popupLocation?.longitude ?? null,
    address:
      popupLocation?.address ||
      popupReview?.area?.addressText ||
      popupReview?.area?.district ||
      null,
  });

  return (
    <div className="min-h-screen bg-[#fffaf4]">
      <Header variant="blue" />

      <main className="pt-[100px]">
        <section className="relative overflow-hidden border-b border-[#f2dfc7] bg-gradient-to-br from-[#fff1de] via-[#ffe4bf] to-[#ffd8a6]">
          <div className="absolute -right-24 -top-20 h-64 w-64 rounded-full bg-[#ffb459]/40 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-[#ff7a4e]/30 blur-3xl" />

          <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f2bc73] bg-white/70 px-3 py-1 text-xs font-semibold text-[#8d4b08]">
                <Flame className="h-3.5 w-3.5" />
                {selectedCity === "all" ? "Foodtour Toàn quốc" : `Foodtour ${selectedCity}`}
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#54270e]">
                Khám phá món ngon theo từng khu vực
              </h1>
              <p className="mt-4 text-[#6e3a16] text-base md:text-lg">
                Tổng hợp review thật từ cộng đồng, lọc theo tỉnh/thành và quận/huyện để bạn chọn đúng quán đúng gu.
              </p>

              <div className="mt-6 flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ac6b34]" />
                  <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        applySearch();
                      }
                    }}
                    placeholder="Tìm món, quán, hoặc từ khóa..."
                    className="h-12 w-full rounded-xl border border-[#f2bc73] bg-white pl-10 pr-3 text-sm text-[#54270e] outline-none transition focus:border-[#e0852b]"
                  />
                </div>
                <Button
                  onClick={applySearch}
                  className="h-12 rounded-xl bg-[#e16a1a] px-6 font-semibold text-white hover:bg-[#c95910]"
                >
                  Tìm review
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-28 py-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-[#54270e]">Khu vực theo tỉnh/thành</h2>
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => {
                  setPage(1);
                  setSortBy("hot");
                }}
                className={`rounded-full px-4 py-2 font-semibold transition ${
                  sortBy === "hot"
                    ? "bg-[#54270e] text-white"
                    : "bg-white text-[#6e3a16] border border-[#e9c79f]"
                }`}
              >
                Hot nhất
              </button>
              <button
                onClick={() => {
                  setPage(1);
                  setSortBy("latest");
                }}
                className={`rounded-full px-4 py-2 font-semibold transition ${
                  sortBy === "latest"
                    ? "bg-[#54270e] text-white"
                    : "bg-white text-[#6e3a16] border border-[#e9c79f]"
                }`}
              >
                Mới nhất
              </button>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setPage(1);
                setSelectedCity("all");
                setSelectedDistrict("all");
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedCity === "all"
                  ? "bg-[#e16a1a] text-white"
                  : "bg-white text-[#6e3a16] border border-[#e9c79f]"
              }`}
            >
              Tất cả
            </button>
            {areas.map((area) => (
              <button
                key={area.city}
                onClick={() => {
                  setPage(1);
                  setSelectedCity(area.city);
                  setSelectedDistrict("all");
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedCity === area.city
                    ? "bg-[#e16a1a] text-white"
                    : "bg-white text-[#6e3a16] border border-[#e9c79f]"
                }`}
              >
                {area.city} ({area.count})
              </button>
            ))}
          </div>

          {selectedCityArea && selectedCityArea.districts.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setPage(1);
                  setSelectedDistrict("all");
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedDistrict === "all"
                    ? "bg-[#54270e] text-white"
                    : "bg-white text-[#6e3a16] border border-[#e9c79f]"
                }`}
              >
                Toàn bộ {selectedCityArea.city}
              </button>
              {selectedCityArea.districts.map((district) => (
                <button
                  key={district.name}
                  onClick={() => {
                    setPage(1);
                    setSelectedDistrict(district.name);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    selectedDistrict === district.name
                      ? "bg-[#54270e] text-white"
                      : "bg-white text-[#6e3a16] border border-[#e9c79f]"
                  }`}
                >
                  {district.name} ({district.count})
                </button>
              ))}
            </div>
          )}

          {trending.length > 0 && (
            <div className="mb-10">
              <h3 className="mb-4 text-lg font-bold text-[#54270e]">Đang được quan tâm</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {trending.slice(0, 3).map((item) => (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-[#f1d7b6] bg-white p-4 shadow-sm"
                  >
                    <div className="mb-2 flex items-center gap-2 text-xs text-[#a05f2d]">
                      <Flame className="h-3.5 w-3.5" />
                      Điểm hot {Math.round(item.engagement.score)}
                    </div>
                    <h4 className="line-clamp-2 text-sm font-bold text-[#54270e]">{item.title}</h4>
                    <div className="mt-3 flex items-center gap-3 text-xs text-[#7e4c27]">
                      <span className="inline-flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" /> {item.engagement.likesCount}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5" /> {item.engagement.commentsCount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-[#f1d7b6] bg-white p-10 text-center text-[#7e4c27]">
              Đang tải food review...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">{error}</div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-[#f1d7b6] bg-white p-10 text-center text-[#7e4c27]">
              Chưa có kết quả phù hợp. Thử đổi khu vực hoặc từ khóa tìm kiếm.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reviews.map((review) => (
                  <article
                    key={review._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => void openReviewDetail(review)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        void openReviewDetail(review);
                      }
                    }}
                    className="overflow-hidden rounded-2xl border border-[#f1d7b6] bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#e16a1a]"
                  >
                    <div className="relative h-[400px] bg-[#ffe9d0]">
                      {review.imageUrls?.[0] ? (
                        <Image
                          src={review.imageUrls[0]}
                          alt={review.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-6xl">🍜</div>
                      )}
                      <div className="absolute left-3 top-3 rounded-full bg-black/65 px-3 py-1 text-[11px] font-medium text-white">
                        {review.area.district || review.area.city || "Chưa xác định"}
                      </div>
                    </div>

                    <div className="space-y-3 p-4">
                      <h3 className="line-clamp-2 text-base font-bold text-[#54270e]">{review.title}</h3>
                      <p className="line-clamp-3 text-sm text-[#724524]">{review.summary}</p>

                      <div className="flex flex-wrap gap-2">
                        {review.dishTags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-[#fff2e3] px-2.5 py-1 text-xs font-medium text-[#a8602a]"
                          >
                            <Tag className="h-3 w-3" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-[#7e4c27]">
                        <div className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate">
                            {review.area.addressText || review.area.district || review.area.city || "Chưa xác định"}
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(review.postedAt)}
                        </div>
                        <div className="inline-flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5" />
                          {review.engagement.likesCount} likes
                        </div>
                        <div className="inline-flex items-center gap-1">
                          <MessageCircle className="h-3.5 w-3.5" />
                          {review.engagement.commentsCount} bình luận
                        </div>
                        <div className="inline-flex items-center gap-1">
                          <Share2 className="h-3.5 w-3.5" />
                          {review.engagement.sharesCount} chia sẻ
                        </div>
                        <div className="inline-flex items-center gap-1">
                          <Flame className="h-3.5 w-3.5" />
                          Hot {Math.round(review.engagement.score)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-[#f3e1ca] pt-3">
                        <div className="text-sm font-semibold text-[#a1571f]">
                          Mức giá: {formatPrice(review.priceMin, review.priceMax)}
                        </div>
                        {review.contactPhones?.[0] && (
                          <div className="inline-flex items-center gap-1 text-xs text-[#7e4c27]">
                            <Phone className="h-3.5 w-3.5" />
                            {review.contactPhones[0]}
                          </div>
                        )}
                      </div>

                      <a
                        href={review.source.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#d45f10] hover:text-[#b04c0c]"
                      >
                        Xem bài gốc
                      </a>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-10 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                  className="border-[#d8b58c] text-[#6e3a16] disabled:opacity-50"
                >
                  Trang trước
                </Button>
                <span className="text-sm font-medium text-[#6e3a16]">
                  Trang {page}/{totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                  className="border-[#d8b58c] text-[#6e3a16] disabled:opacity-50"
                >
                  Trang sau
                </Button>
              </div>
            </>
          )}
        </section>

        {detailOpen && popupReview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
            onClick={closeReviewDetail}
          >
            <div
              className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-[#fff8ef] shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeReviewDetail}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-[#6e3a16] shadow hover:bg-white"
                aria-label="Đóng popup"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
                <div className="relative min-h-[280px] bg-[#f6d5b0] lg:min-h-[420px]">
                  {popupReview.imageUrls?.[0] ? (
                    <Image
                      src={popupReview.imageUrls[0]}
                      alt={popupReview.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-8xl">🍲</div>
                  )}
                </div>

                <div className="space-y-4 p-6 lg:p-8">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b6672d]">
                      Foodtour Review Detail
                    </p>
                    <h3 className="text-2xl font-black leading-tight text-[#54270e]">
                      {popupReview.title}
                    </h3>
                    <p className="text-sm text-[#7a4a24]">
                      {popupReview.summary || "Chưa có tóm tắt cho review này."}
                    </p>
                  </div>

                  {detailLoading ? (
                    <div className="rounded-2xl border border-[#efcfab] bg-white p-4">
                      <div className="flex items-center gap-3 text-sm text-[#7e4c27]">
                        <Loader2 className="h-5 w-5 animate-spin text-[#d45f10]" />
                        <span>Đang tải dữ liệu chi tiết...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {detailError && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                          {detailError}
                        </div>
                      )}

                      {popupSocial?.warning && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                          Lưu ý: {popupSocial.warning}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl bg-white p-3 shadow-sm">
                          <div className="inline-flex items-center gap-2 text-[#9f5b2a]">
                            <Heart className="h-4 w-4" /> Like
                          </div>
                          <div className="mt-1 text-xl font-black text-[#54270e]">
                            {popupSocial?.likeCount ?? popupReview.engagement.likesCount}
                          </div>
                        </div>
                        <div className="rounded-xl bg-white p-3 shadow-sm">
                          <div className="inline-flex items-center gap-2 text-[#9f5b2a]">
                            <ThumbsDown className="h-4 w-4" /> Dislike
                          </div>
                          <div className="mt-1 text-xl font-black text-[#54270e]">
                            {popupSocial?.dislikeCount ?? 0}
                          </div>
                        </div>
                        <div className="rounded-xl bg-white p-3 shadow-sm">
                          <div className="inline-flex items-center gap-2 text-[#9f5b2a]">
                            <MessageCircle className="h-4 w-4" /> Bình luận
                          </div>
                          <div className="mt-1 text-xl font-black text-[#54270e]">
                            {popupSocial?.commentCount ?? popupReview.engagement.commentsCount}
                          </div>
                        </div>
                        <div className="rounded-xl bg-white p-3 shadow-sm">
                          <div className="inline-flex items-center gap-2 text-[#9f5b2a]">
                            <Share2 className="h-4 w-4" /> Chia sẻ
                          </div>
                          <div className="mt-1 text-xl font-black text-[#54270e]">
                            {popupSocial?.shareCount ?? popupReview.engagement.sharesCount}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#efcfab] bg-white p-4">
                        <p className="mb-1 text-xs uppercase tracking-[0.1em] text-[#a8612d]">
                          Địa chỉ quán
                        </p>
                        <p className="text-sm font-semibold text-[#54270e]">
                          {popupLocation?.address ||
                            popupReview.area.addressText ||
                            popupReview.area.district ||
                            popupReview.area.city ||
                            "Chưa có địa chỉ"}
                        </p>
                        <p className="mt-1 text-xs text-[#8b5d37]">
                          Latitude: {popupLocation?.latitude ?? "N/A"} | Longitude: {" "}
                          {popupLocation?.longitude ?? "N/A"}
                        </p>
                      </div>

                      {popupMapUrl ? (
                        <div className="overflow-hidden rounded-2xl border border-[#efcfab] bg-white">
                          <iframe
                            title="Bản đồ quán ăn"
                            src={popupMapUrl}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="h-64 w-full border-0"
                          />
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-[#ddb88f] bg-white/70 p-4 text-sm text-[#8b5d37]">
                          Chưa đủ dữ liệu để hiển thị bản đồ.
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-3 pt-2 text-sm">
                        <span className="text-[#8b5d37]">
                          Nguồn dữ liệu: {popupSocial?.source === "apify" ? "Apify Actor" : "Dữ liệu nội bộ"}
                        </span>
                        <a
                          href={popupReview.source.postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[#d45f10] hover:text-[#b04c0c]"
                        >
                          Xem bài Facebook
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
