"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import {
  FaPlus,
  FaHome,
  FaCalendarCheck,
  FaDollarSign,
  FaChartLine,
  FaBed,
  FaBath,
  FaEdit,
  FaTrash,
  FaEye,
} from "react-icons/fa";

interface Apartment {
  id: string;
  title: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  price_per_month: number;
  status: string;
  views_count: number;
  apartment_images: { url: string }[];
  bookings: any[];
}

export default function LandlordDashboard() {
  const { user, profile, isLoading } = useAuthStore();
  const router = useRouter();
  const supabase = createClient();

  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeBookings: 0,
    monthlyRevenue: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait until auth has finished loading before checking
    if (isLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (profile?.role !== "LANDLORD") {
      toast.error("Access denied");
      router.push("/");
      return;
    }

    fetchData();
  }, [user, profile, isLoading]);

  const fetchData = async () => {
    try {
      // Fetch apartments
      const { data: apartmentsData, error: apartmentsError } = await supabase
        .from("apartments")
        .select(
          `
          *,
          apartment_images(url),
          bookings(id, status)
        `,
        )
        .eq("landlord_id", user!.id)
        .order("created_at", { ascending: false });

      if (apartmentsError) throw apartmentsError;

      setApartments(apartmentsData || []);

      // Calculate stats
      const totalProperties = apartmentsData?.length || 0;
      const activeBookings =
        apartmentsData?.reduce(
          (acc, apt) =>
            acc +
            (apt.bookings?.filter((b: any) => b.status === "CONFIRMED")
              .length || 0),
          0,
        ) || 0;
      const totalViews =
        apartmentsData?.reduce((acc, apt) => acc + (apt.views_count || 0), 0) ||
        0;

      // Calculate monthly revenue from confirmed bookings
      const { data: revenueData } = await supabase
        .from("bookings")
        .select("total_amount")
        .in("apartment_id", apartmentsData?.map((a) => a.id) || [])
        .eq("status", "CONFIRMED");

      const monthlyRevenue =
        revenueData?.reduce((acc, b) => acc + (b.total_amount || 0), 0) || 0;

      setStats({
        totalProperties,
        activeBookings,
        monthlyRevenue,
        totalViews,
      });
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const deleteApartment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this apartment?")) return;

    try {
      const { error } = await supabase.from("apartments").delete().eq("id", id);

      if (error) throw error;

      toast.success("Apartment deleted successfully");
      fetchData();
    } catch (error: any) {
      toast.error("Failed to delete apartment");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: "bg-gray-100 text-gray-700",
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-700",
    };
    return styles[status] ?? "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              Landlord Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Manage your properties and bookings
            </p>
          </div>
          <Link
            href="/dashboard/landlord/properties/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
          >
            <FaPlus />
            Add Property
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Properties",
              value: stats.totalProperties,
              Icon: FaHome,
              bg: "bg-emerald-50",
              color: "text-emerald-600",
            },
            {
              label: "Active Bookings",
              value: stats.activeBookings,
              Icon: FaCalendarCheck,
              bg: "bg-emerald-50",
              color: "text-emerald-600",
            },
            {
              label: "Revenue (Le)",
              value: stats.monthlyRevenue.toLocaleString("en", {
                maximumFractionDigits: 0,
              }),
              Icon: FaDollarSign,
              bg: "bg-yellow-50",
              color: "text-yellow-600",
            },
            {
              label: "Total Views",
              value: stats.totalViews,
              Icon: FaChartLine,
              bg: "bg-purple-50",
              color: "text-purple-600",
            },
          ].map(({ label, value, Icon, bg, color }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-gray-100 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}
                >
                  <Icon className={`${color} text-lg`} />
                </div>
              </div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Properties */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            My Properties
          </h2>

          {apartments.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <FaHome className="text-gray-400 text-2xl" />
              </div>
              <p className="text-gray-900 font-bold text-xl mb-2">
                No properties yet
              </p>
              <p className="text-gray-500 mb-6">
                Start by listing your first property
              </p>
              <Link
                href="/dashboard/landlord/properties/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
              >
                <FaPlus /> Add Your First Property
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apartments.map((apartment) => (
                <div
                  key={apartment.id}
                  className="group rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 duration-200"
                >
                  <div className="relative h-48 bg-gray-100">
                    {apartment.apartment_images?.[0]?.url ? (
                      <Image
                        src={apartment.apartment_images[0].url}
                        alt={apartment.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaHome className="text-gray-300 text-4xl" />
                      </div>
                    )}
                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadge(apartment.status)}`}
                    >
                      {apartment.status}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 truncate">
                      {apartment.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-3">
                      {apartment.city}, Sierra Leone
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <FaBed className="text-primary-500" />
                        {apartment.bedrooms}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaBath className="text-primary-500" />
                        {apartment.bathrooms}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaEye className="text-gray-400" />
                        {apartment.views_count || 0}
                      </span>
                    </div>

                    <p className="text-lg font-black text-emerald-600 mb-4">
                      Le {apartment.price_per_month.toLocaleString()}
                      <span className="text-gray-500 font-normal text-sm">
                        /mo
                      </span>
                    </p>

                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/landlord/properties/${apartment.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors"
                      >
                        <FaEdit />
                        Edit
                      </Link>
                      <Link
                        href={`/apartments/${apartment.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors"
                      >
                        <FaEye />
                        View
                      </Link>
                      <button
                        onClick={() => deleteApartment(apartment.id)}
                        className="p-2 border border-red-100 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                      >
                        <FaTrash />
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
  );
}
