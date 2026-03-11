"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaStar, FaHome } from "react-icons/fa";

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");

  const [apartment, setApartment] = useState<{
    id: string;
    title: string;
    city: string;
    apartment_images: { url: string }[];
  } | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (params.id && user) fetchData();
  }, [params.id, user]);

  const fetchData = async () => {
    try {
      // Load apartment
      const { data: apt, error: aptErr } = await supabase
        .from("apartments")
        .select("id, title, city, apartment_images(url)")
        .eq("id", params.id)
        .single();

      if (aptErr) throw aptErr;
      setApartment(apt);

      // Find a completed booking for this renter + apartment
      const { data: booking, error: bookErr } = await supabase
        .from("bookings")
        .select("id")
        .eq("apartment_id", params.id)
        .eq("renter_id", user!.id)
        .eq("status", "COMPLETED")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (bookErr || !booking) {
        toast.error("You need a completed booking to leave a review");
        router.push(`/apartments/${params.id}`);
        return;
      }

      setBookingId(booking.id);

      // Check if review already exists
      const { data: existing } = await supabase
        .from("reviews")
        .select("id")
        .eq("booking_id", booking.id)
        .single();

      if (existing) {
        toast("You've already reviewed this property");
        router.push(`/apartments/${params.id}`);
        return;
      }
    } catch (err: any) {
      toast.error("Could not load review form");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    if (!bookingId || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        apartment_id: params.id,
        booking_id: bookingId,
        renter_id: user.id,
        rating,
        comment: comment.trim() || null,
      });

      if (error) throw error;
      toast.success("Review submitted! Thank you.");
      router.push(`/apartments/${params.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!apartment) return null;

  const cover = apartment.apartment_images?.[0]?.url;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-xl mx-auto px-4 py-5 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-xl font-black text-gray-900">Write a Review</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        {/* Property card */}
        <div className="bg-white rounded-2xl border border-gray-100 flex gap-4 p-5">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            {cover ? (
              <Image
                src={cover}
                alt={apartment.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FaHome className="text-gray-300 text-2xl" />
              </div>
            )}
          </div>
          <div>
            <p className="font-bold text-gray-900">{apartment.title}</p>
            <p className="text-sm text-gray-500">
              {apartment.city}, Sierra Leone
            </p>
          </div>
        </div>

        {/* Review form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6"
        >
          {/* Star rating */}
          <div>
            <p className="font-bold text-gray-900 mb-3">
              Your rating <span className="text-red-500">*</span>
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="text-3xl transition-transform hover:scale-110"
                >
                  <FaStar
                    className={
                      star <= (hovered || rating)
                        ? "text-yellow-400"
                        : "text-gray-200"
                    }
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block font-bold text-gray-900 mb-2">
              Your review
            </label>
            <textarea
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell other renters about your experience — location, condition, landlord responsiveness…"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:border-green-500 focus:bg-white transition-colors text-sm placeholder:text-gray-400 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Link
              href={`/apartments/${params.id}`}
              className="flex-1 text-center py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
