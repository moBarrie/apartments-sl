"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import {
  FaArrowLeft,
  FaHome,
  FaMapMarkerAlt,
  FaCalendar,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaFlagCheckered,
} from "react-icons/fa";

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number;
  deposit_amount: number;
  special_requests: string | null;
  created_at: string;
  renter_id: string;
  apartments: {
    id: string;
    title: string;
    address: string;
    city: string;
    price_per_month: number;
    landlord_id: string;
    apartment_images: { url: string }[];
  };
  users: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string; Icon: any }
> = {
  PENDING: {
    label: "Pending",
    color: "text-yellow-700",
    bg: "bg-yellow-50 border-yellow-200",
    Icon: FaHourglassHalf,
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    Icon: FaCheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    Icon: FaTimesCircle,
  },
  COMPLETED: {
    label: "Completed",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    Icon: FaFlagCheckered,
  },
};

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const supabase = createClient();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (params.id) fetchBooking();
  }, [params.id]);

  const fetchBooking = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          apartments(id, title, address, city, price_per_month, landlord_id, apartment_images(url)),
          users!bookings_renter_id_fkey(full_name, email, phone)
        `,
        )
        .eq("id", params.id)
        .single();

      if (error) throw error;

      // Only the renter or the landlord can view
      const isRenter = data.renter_id === user?.id;
      const isLandlord = data.apartments.landlord_id === user?.id;
      if (!isRenter && !isLandlord) {
        toast.error("Access denied");
        router.back();
        return;
      }

      setBooking(data);
    } catch (err: any) {
      toast.error("Booking not found");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!booking) return;
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", booking.id);

      if (error) throw error;
      setBooking({ ...booking, status: newStatus });
      toast.success(`Booking ${newStatus.toLowerCase()}`);
    } catch (err: any) {
      toast.error("Failed to update booking");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) return null;

  const meta = STATUS_META[booking.status] ?? STATUS_META.PENDING;
  const StatusIcon = meta.Icon;
  const isLandlord = booking.apartments.landlord_id === user?.id;
  const isRenter = booking.renter_id === user?.id;
  const coverImage = booking.apartments.apartment_images?.[0]?.url;

  const nights = Math.round(
    (new Date(booking.end_date).getTime() -
      new Date(booking.start_date).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900">
              Booking Details
            </h1>
            <p className="text-xs text-gray-400 font-mono">
              #{booking.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Status banner */}
        <div
          className={`flex items-center gap-3 px-5 py-4 rounded-2xl border ${meta.bg}`}
        >
          <StatusIcon className={`text-xl ${meta.color}`} />
          <div>
            <p className={`font-bold ${meta.color}`}>{meta.label}</p>
            <p className="text-xs text-gray-500">
              Booked on{" "}
              {new Date(booking.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Property card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex gap-4 p-5">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              {coverImage ? (
                <Image
                  src={coverImage}
                  alt={booking.apartments.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaHome className="text-gray-300 text-2xl" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/apartments/${booking.apartments.id}`}
                className="font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2"
              >
                {booking.apartments.title}
              </Link>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                <FaMapMarkerAlt className="text-green-500 flex-shrink-0" />
                {booking.apartments.address}, {booking.apartments.city}
              </p>
            </div>
          </div>
        </div>

        {/* Dates & pricing */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Booking Summary</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
            {[
              {
                label: "Check-in",
                value: new Date(booking.start_date).toLocaleDateString(
                  "en-GB",
                  { day: "numeric", month: "short", year: "numeric" },
                ),
                Icon: FaCalendar,
              },
              {
                label: "Check-out",
                value: new Date(booking.end_date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
                Icon: FaCalendar,
              },
              {
                label: "Duration",
                value: `${nights} night${nights !== 1 ? "s" : ""}`,
                Icon: FaHourglassHalf,
              },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="font-bold text-gray-900 text-sm">{value}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Security deposit</span>
              <span className="font-semibold text-gray-900">
                Le {booking.deposit_amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Total amount</span>
              <span className="font-bold text-xl text-primary-600">
                Le {booking.total_amount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Special requests */}
        {booking.special_requests && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-2">Special Requests</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {booking.special_requests}
            </p>
          </div>
        )}

        {/* Renter info (visible to landlord) */}
        {isLandlord && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Renter Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="font-semibold text-gray-900">
                  {booking.users.full_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <a
                  href={`mailto:${booking.users.email}`}
                  className="font-semibold text-primary-600 hover:underline"
                >
                  {booking.users.email}
                </a>
              </div>
              {booking.users.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <a
                    href={`tel:${booking.users.phone}`}
                    className="font-semibold text-gray-900"
                  >
                    {booking.users.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {/* Landlord actions */}
          {isLandlord && booking.status === "PENDING" && (
            <>
              <button
                onClick={() => updateStatus("CONFIRMED")}
                disabled={updating}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors"
              >
                Confirm Booking
              </button>
              <button
                onClick={() => updateStatus("CANCELLED")}
                disabled={updating}
                className="flex-1 py-3 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-60 font-bold rounded-xl transition-colors"
              >
                Decline
              </button>
            </>
          )}
          {isLandlord && booking.status === "CONFIRMED" && (
            <button
              onClick={() => updateStatus("COMPLETED")}
              disabled={updating}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors"
            >
              Mark as Completed
            </button>
          )}

          {/* Renter actions */}
          {isRenter && booking.status === "PENDING" && (
            <button
              onClick={() => updateStatus("CANCELLED")}
              disabled={updating}
              className="flex-1 py-3 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-60 font-bold rounded-xl transition-colors"
            >
              Cancel Booking
            </button>
          )}
          {isRenter && booking.status === "COMPLETED" && (
            <Link
              href={`/apartments/${booking.apartments.id}/review`}
              className="flex-1 text-center py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors"
            >
              Write a Review
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
