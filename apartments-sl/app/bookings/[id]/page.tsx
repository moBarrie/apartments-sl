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

  const moveInDate = new Date(booking.start_date);
  const moveOutDate = new Date(booking.end_date);
  const months = (moveOutDate.getFullYear() - moveInDate.getFullYear()) * 12 + (moveOutDate.getMonth() - moveInDate.getMonth());

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20 relative overflow-hidden">
       {/* Background ambient light */}
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors shadow-sm"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Reservation Details
            </h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
              Ref ID: {booking.id.slice(0, 8).toUpperCase()}
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
        <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
          <div className="flex gap-6 p-6">
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
              {coverImage ? (
                <Image
                  src={coverImage}
                  alt={booking.apartments.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaHome className="text-slate-300 text-3xl" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <Link
                href={`/apartments/${booking.apartments.id}`}
                className="text-lg font-black text-slate-900 hover:text-emerald-600 transition-colors line-clamp-1 tracking-tight"
              >
                {booking.apartments.title}
              </Link>
              <p className="text-sm text-slate-500 flex items-center gap-2 mt-2 font-light">
                <FaMapMarkerAlt className="text-emerald-500 flex-shrink-0" />
                {booking.apartments.address}, {booking.apartments.city}
              </p>
            </div>
          </div>
        </div>

        {/* Dates & pricing */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Financial Summary</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
            {[
              {
                label: "Move-In",
                value: new Date(booking.start_date).toLocaleDateString(
                  "en-GB",
                  { day: "numeric", month: "short", year: "numeric" },
                ),
                Icon: FaCalendar,
              },
              {
                label: "Move-Out",
                value: new Date(booking.end_date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
                Icon: FaCalendar,
              },
              {
                label: "Lease Period",
                value: `${months} month${months !== 1 ? "s" : ""}`,
                Icon: FaHourglassHalf,
              },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
                <p className="font-bold text-slate-900">{value}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Security Deposit (One-time)</span>
              <span className="font-bold text-slate-900">
                Le {booking.deposit_amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Transaction Value</span>
              <span className="text-2xl font-black text-emerald-600">
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
                  className="font-bold text-emerald-600 hover:underline"
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
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20"
              >
                Confirm Residency
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
                className="flex-1 py-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold rounded-2xl transition-all shadow-lg"
              >
                Mark as Occupied / Completed
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
              className="flex-1 text-center py-4 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-lg"
            >
              Write a Review
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
