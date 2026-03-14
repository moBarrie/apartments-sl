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
  FaBuilding,
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
  property_type: string;
  total_units: number;
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
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
          <div className="h-10 bg-slate-200 rounded-full w-1/4 mb-10" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-100 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-slate-100 rounded-[2rem]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: "bg-slate-100 text-slate-500",
      PENDING: "bg-amber-100 text-amber-700",
      APPROVED: "bg-emerald-100 text-emerald-700",
      REJECTED: "bg-rose-100 text-rose-700",
    };
    return styles[status] ?? "bg-slate-100 text-slate-400";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-100 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Landlord Dashboard
            </h1>
            <p className="text-slate-500 font-light mt-1">
              Manage your elite property portfolio
            </p>
          </div>
          <Link
            href="/dashboard/landlord/properties/new"
            className="inline-flex items-center gap-3 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <FaPlus />
            Launch Property
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
              className="bg-white rounded-[1.5rem] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center`}
                >
                  <Icon className={`${color} text-xl`} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Properties */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-8">
            My Portfolio
          </h2>

          {apartments.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-slate-100">
                <FaHome className="text-slate-300 text-3xl" />
              </div>
              <p className="text-slate-900 font-black text-2xl mb-2 tracking-tight">
                Your portfolio is empty
              </p>
              <p className="text-slate-500 font-light mb-10 max-w-xs mx-auto">
                Begin your journey by listing your first verified residence
              </p>
              <Link
                href="/dashboard/landlord/properties/new"
                className="inline-flex items-center gap-3 px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <FaPlus /> Start Your First Listing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {apartments.map((apartment) => (
                <div
                  key={apartment.id}
                  className="group rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 duration-300 bg-white"
                >
                  <div className="relative h-56 bg-slate-100">
                    {apartment.apartment_images?.[0]?.url ? (
                      <Image
                        src={apartment.apartment_images[0].url}
                        alt={apartment.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaHome className="text-slate-300 text-4xl" />
                      </div>
                    )}
                    <span
                      className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${getStatusBadge(apartment.status)}`}
                    >
                      {apartment.status}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <p className="text-slate-500 text-xs font-medium truncate uppercase tracking-wider">
                        {apartment.city}, Sierra Leone
                      </p>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg uppercase tracking-widest border border-emerald-100">
                        {apartment.property_type?.replace("_", " ")}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 mb-4 line-clamp-1 tracking-tight">
                      {apartment.title}
                    </h3>

                    <div className="flex items-center gap-5 text-sm text-slate-500 mb-6">
                      <span className="flex items-center gap-1.5 font-bold">
                        <FaBed className="text-emerald-500" />
                        {apartment.bedrooms}
                      </span>
                      <span className="flex items-center gap-1.5 font-bold">
                        <FaBath className="text-emerald-500" />
                        {apartment.bathrooms}
                      </span>
                      <span className="flex items-center gap-1.5 font-bold">
                        <FaEye className="text-slate-400" />
                        {apartment.views_count || 0}
                      </span>
                      {apartment.property_type === "APARTMENT_BLOCK" && (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-black text-xs">
                          <FaBuilding className="w-3.5 h-3.5" />
                          {apartment.total_units} U
                        </div>
                      )}
                    </div>

                    <p className="text-xl font-black text-emerald-600 mb-6">
                      Le {apartment.price_per_month.toLocaleString()}
                      <span className="text-slate-400 font-bold text-xs uppercase tracking-widest ml-1">
                        / mo
                      </span>
                    </p>

                    <div className="flex gap-3">
                      <Link
                        href={`/dashboard/landlord/properties/${apartment.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-3 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                      >
                        <FaEdit />
                        Edit
                      </Link>
                      <Link
                        href={`/apartments/${apartment.id}`}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all active:scale-95"
                      >
                        <FaEye />
                        View
                      </Link>
                      <button
                        onClick={() => deleteApartment(apartment.id)}
                        className="w-11 h-11 flex items-center justify-center border border-rose-100 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all active:scale-95 flex-shrink-0"
                      >
                        <FaTrash className="text-xs" />
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
