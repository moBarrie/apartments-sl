"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import {
  FaHeart,
  FaCalendarAlt,
  FaHome,
  FaStar,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
} from "react-icons/fa";

interface Favorite {
  id: string;
  apartment_id: string;
  apartments: {
    id: string;
    title: string;
    city: string;
    bedrooms: number;
    bathrooms: number;
    price_per_month: number;
    apartment_images: { url: string }[];
  };
}

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number;
  apartments: {
    id: string;
    title: string;
    city: string;
    address: string;
    apartment_images: { url: string }[];
  };
}

export default function RenterDashboard() {
  const { user, profile, isLoading } = useAuthStore();
  const router = useRouter();
  const supabase = createClient();

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<"favorites" | "bookings">(
    "bookings",
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait until auth has finished loading before checking
    if (isLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (profile?.role !== "RENTER") {
      toast.error("Access denied");
      router.push("/");
      return;
    }

    fetchData();
  }, [user, profile, isLoading]);

  const fetchData = async () => {
    try {
      // Fetch favorites
      const { data: favoritesData, error: favError } = await supabase
        .from("favorites")
        .select(
          `
          *,
          apartments(
            id,
            title,
            city,
            bedrooms,
            bathrooms,
            price_per_month,
            apartment_images(url)
          )
        `,
        )
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (favError) throw favError;
      setFavorites(favoritesData || []);

      // Fetch bookings
      const { data: bookingsData, error: bookError } = await supabase
        .from("bookings")
        .select(
          `
          *,
          apartments(
            id,
            title,
            city,
            address,
            apartment_images(url)
          )
        `,
        )
        .eq("renter_id", user!.id)
        .order("created_at", { ascending: false });

      if (bookError) throw bookError;
      setBookings(bookingsData || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", favoriteId);

      if (error) throw error;

      setFavorites(favorites.filter((f) => f.id !== favoriteId));
      toast.success("Removed from favorites");
    } catch (error: any) {
      toast.error("Failed to remove favorite");
    }
  };

  const getBookingStatusBadge = (status: string) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      COMPLETED: "bg-blue-100 text-blue-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse">
          <div className="h-10 bg-slate-200 rounded-full w-1/4 mb-10" />
          <div className="h-14 bg-slate-100 rounded-2xl mb-8" />
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-slate-100 rounded-[2rem]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-100 pb-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Renter Dashboard</h1>
          <p className="text-slate-500 font-light mt-1">
            Manage your residency applications and saved collections
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="border-b border-gray-100 px-6">
            <nav className="flex gap-1">
              <button
                onClick={() => setActiveTab("bookings")}
                className={`py-4 px-4 text-sm font-bold border-b-2 transition-all ${
                  activeTab === "bookings"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <FaCalendarAlt className="inline mr-2" />
                Bookings
                {bookings.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs">
                    {bookings.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`py-4 px-4 text-sm font-bold border-b-2 transition-all ${
                  activeTab === "favorites"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <FaHeart className="inline mr-2" />
                Saved
                {favorites.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs">
                    {favorites.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "bookings" ? (
              bookings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <FaCalendarAlt className="text-gray-400 text-2xl" />
                  </div>
                  <p className="text-gray-900 font-bold text-xl mb-2">
                    No bookings yet
                  </p>
                  <p className="text-gray-500 mb-6">
                    Find your perfect apartment and make your first booking
                  </p>
                  <Link
                    href="/apartments"
                    className="inline-flex items-center px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Explore Collections
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row gap-5">
                        <div className="relative w-full md:w-44 h-44 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                          {booking.apartments.apartment_images?.[0]?.url ? (
                            <Image
                              src={booking.apartments.apartment_images[0].url}
                              alt={booking.apartments.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FaHome className="text-gray-300 text-4xl" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                            <Link
                              href={`/apartments/${booking.apartments.id}`}
                              className="text-xl font-black text-slate-900 hover:text-emerald-600 transition-colors line-clamp-1 tracking-tight"
                            >
                              {booking.apartments.title}
                            </Link>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${getBookingStatusBadge(booking.status)}`}
                            >
                              {booking.status}
                            </span>
                          </div>
                          <p className="text-gray-500 text-sm flex items-center gap-1.5 mb-4">
                            <FaMapMarkerAlt className="text-green-500 flex-shrink-0" />
                            {booking.apartments.address},{" "}
                            {booking.apartments.city}
                          </p>

                          <div className="grid grid-cols-3 gap-3 mb-4">
                            {[
                              {
                                label: "Check-in",
                                val: new Date(
                                  booking.start_date,
                                ).toLocaleDateString(),
                              },
                              {
                                label: "Check-out",
                                val: new Date(
                                  booking.end_date,
                                ).toLocaleDateString(),
                              },
                              {
                                label: "Total",
                                val: `Le ${booking.total_amount.toLocaleString()}`,
                              },
                            ].map(({ label, val }) => (
                              <div
                                key={label}
                                className="bg-gray-50 rounded-xl p-3"
                              >
                                <p className="text-xs text-gray-500 mb-0.5">
                                  {label}
                                </p>
                                <p className="font-bold text-gray-900 text-sm">
                                  {val}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-3">
                            <Link
                              href={`/bookings/${booking.id}`}
                              className="px-6 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg"
                            >
                              Details
                            </Link>
                            {booking.status === "COMPLETED" && (
                              <Link
                                href={`/apartments/${booking.apartments.id}/review`}
                                className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors"
                              >
                                <FaStar className="inline mr-1" />
                                Write Review
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : favorites.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <FaHeart className="text-gray-400 text-2xl" />
                </div>
                <p className="text-gray-900 font-bold text-xl mb-2">
                  No saved properties yet
                </p>
                <p className="text-gray-500 mb-6">
                  Heart any apartment to save it here for later
                </p>
                <Link
                  href="/apartments"
                  className="inline-flex items-center px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
                >
                  Save Some Favorites
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {favorites.map((favorite) => (
                  <div
                    key={favorite.id}
                    className="group rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 duration-200"
                  >
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      {favorite.apartments.apartment_images?.[0]?.url ? (
                        <Image
                          src={favorite.apartments.apartment_images[0].url}
                          alt={favorite.apartments.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaHome className="text-gray-300 text-4xl" />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1 truncate">
                        {favorite.apartments.title}
                      </h3>
                      <p className="text-gray-500 text-sm mb-3">
                        {favorite.apartments.city}, Sierra Leone
                      </p>

                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                        <span className="flex items-center gap-1.5">
                          <FaBed className="text-emerald-500" />
                          {favorite.apartments.bedrooms} BR
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FaBath className="text-emerald-500" />
                          {favorite.apartments.bathrooms} BA
                        </span>
                      </div>

                      <p className="text-xl font-black text-emerald-600 mb-5">
                        Le{" "}
                        {favorite.apartments.price_per_month.toLocaleString()}
                        <span className="text-slate-400 font-bold text-xs uppercase tracking-widest ml-1">
                          / mo
                        </span>
                      </p>

                      <div className="flex gap-2">
                        <Link
                          href={`/apartments/${favorite.apartments.id}`}
                          className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold text-center transition-all shadow-md"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => removeFavorite(favorite.id)}
                          className="p-2 border border-red-100 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                        >
                          <FaHeart />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
