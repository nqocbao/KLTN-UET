"use client";

import { useState } from "react";
import { Star, MessageSquare, Calendar, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  tourName: string;
  tourImage: string;
  rating: number;
  content: string;
  date: string;
  likes: number;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="w-10 h-10 text-gray-400" />
      </div>
      <p className="text-gray-500 text-lg mb-2">Chưa có đánh giá nào</p>
      <p className="text-gray-400 text-sm mb-4">Hãy đặt tour và chia sẻ trải nghiệm của bạn</p>
      <Button className="bg-blue-600 hover:bg-blue-700">
        Xem các tour
      </Button>
    </div>
  );

  const RatingStars = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "w-4 h-4",
            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          )}
        />
      ))}
    </div>
  );

  const ReviewCard = ({ review }: { review: Review }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        <img
          src={review.tourImage}
          alt={review.tourName}
          className="w-24 h-24 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{review.tourName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <RatingStars rating={review.rating} />
            <span className="text-sm text-gray-500">
              <Calendar className="w-3 h-3 inline mr-1" />
              {new Date(review.date).toLocaleDateString("vi-VN")}
            </span>
          </div>
          <p className="text-gray-600 mt-2 line-clamp-2">{review.content}</p>
          <div className="flex items-center gap-4 mt-3">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              <ThumbsUp className="w-4 h-4 mr-1" />
              {review.likes} lượt thích
            </Button>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              Chỉnh sửa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Nhận xét của tôi</h2>
        <span className="text-sm text-gray-500">{reviews.length} đánh giá</span>
      </div>

      <div className="p-6">
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
