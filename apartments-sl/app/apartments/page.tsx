"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  FaBed,
  FaBath,
  FaMapMarkerAlt,
  FaHeart,
  FaRegHeart,
  FaSearch,
  FaFilter,
  FaBuilding,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

interface Apartment {
  id: string;
  title: string;
  description: string;
  city: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  price_per_month: number;
  square_feet: number | null;
  property_type: string;
  total_units: number;
  apartment_images: { url: string }[];
}

function ApartmentsContent() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const searchParams = useSearchParams();
  const city = searchParams.get("city");
  const minPrice = searchParams.get("minPrice");
  const bedrooms = searchParams.get("bedrooms");

  const { user } = useAuthStore();
  const supabase = createClient();

  useEffect(() => {
    fetchApartments();
    if (user) fetchFavorites();
  }, [city, minPrice, bedrooms]);

  const fetchApartments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("apartments")
        .select(
          `
          *,
          apartment_images(url)
        `,
        )
        .eq("status", "APPROVED")
        .order("created_at", { ascending: false });

      if (city && city.trim() !== "") query = query.ilike("city", `%${city}%`);
      if (minPrice && minPrice.trim() !== "") query = query.gte("price_per_month", parseFloat(minPrice));
      if (bedrooms && bedrooms.trim() !== "") query = query.gte("bedrooms", parseInt(bedrooms));

      const { data, error } = await query;

      if (error) throw error;
      setApartments(data || []);
    } catch (error: any) {
      console.error("Error fetching apartments:", error);
      toast.error("Failed to load apartments");
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const { data } = await supabase
        .from("favorites")
        .select("apartment_id")
        .eq("user_id", user!.id);

      if (data) {
        setFavorites(new Set(data.map((f) => f.apartment_id)));
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const toggleFavorite = async (apartmentId: string) => {
    if (!user) {
      toast.error("Please sign in to save favorites");
      return;
    }

    const isFavorite = favorites.has(apartmentId);

    try {
      if (isFavorite) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("apartment_id", apartmentId);

        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(apartmentId);
          return next;
        });
        toast.success("Removed from favorites");
      } else {
        await supabase
          .from("favorites")
          .insert({ user_id: user.id, apartment_id: apartmentId });

        setFavorites((prev) => new Set(prev).add(apartmentId));
        toast.success("Added to favorites");
      }
    } catch (error: any) {
      toast.error("Failed to update favorites");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 font-sans">
      {/* Search Header Banner */}
      <div className="bg-white border-b border-slate-200/60 shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-emerald-600 font-bold text-xs uppercase tracking-[0.2em] mb-3">
                Property Portfolio
              </p>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
                Discover Properties
              </h1>
              <p className="text-slate-500 font-light text-lg">
                <span className="font-semibold text-slate-900">
                  {loading ? "..." : apartments.length}
                </span>{" "}
                {apartments.length === 1 ? "residence" : "residences"} matching your criteria
                {city && (
                  <>
                    {" "}
                    in <span className="font-medium text-slate-900">{city}</span>
                  </>
                )}
              </p>
            </div>
            
            <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100/80 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-xl transition-colors self-start md:self-auto">
              <FaFilter className="w-3.5 h-3.5" />
              Adjust Filters
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
         {/* Background Decoration */}
         <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden animate-pulse shadow-sm"
              >
                <div className="h-64 bg-slate-200" />
                <div className="p-8 space-y-4">
                  <div className="h-5 bg-slate-200 rounded-full w-3/4" />
                  <div className="h-4 bg-slate-200 rounded-full w-1/2" />
                  <div className="h-4 bg-slate-200 rounded-full w-1/3 mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : apartments.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-slate-100 p-20 text-center shadow-lg relative overflow-hidden">
             <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
            <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 relative z-10">
              <FaSearch className="text-slate-300 text-4xl" />
            </div>
            <h2 className="text-slate-900 text-2xl font-black tracking-tight mb-3 relative z-10">
              No Properties Found
            </h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto font-light leading-relaxed relative z-10">
              We couldn't find any residences matching your exact specifications. Try adjusting your filters or explore our full collection.
            </p>
            <Link
              href="/apartments"
              className="inline-flex items-center px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all hover:shadow-[0_10px_20px_rgba(0,0,0,0.1)] relative z-10"
            >
              Clear Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {apartments.map((apartment) => (
              <div
                key={apartment.id}
                className="group flex flex-col bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500 relative z-10"
              >
                <Link href={`/apartments/${apartment.id}`} className="block relative h-64 bg-slate-100 overflow-hidden">
                  {apartment.apartment_images?.[0]?.url ? (
                    <Image
                      src={apartment.apartment_images[0].url}
                      alt={apartment.title}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                      <FaBed className="text-slate-300 text-5xl" />
                    </div>
                  )}
                  
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                </Link>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(apartment.id);
                  }}
                  className="absolute top-5 right-5 w-10 h-10 glass-dark rounded-full shadow-lg flex items-center justify-center hover:bg-white/20 transition-colors z-20 backdrop-blur-md"
                >
                  {favorites.has(apartment.id) ? (
                    <FaHeart className="text-red-500 w-4 h-4 transform scale-110 transition-transform" />
                  ) : (
                    <FaRegHeart className="text-white drop-shadow-md w-4 h-4 transition-transform hover:scale-110" />
                  )}
                </button>

                <div className="p-8 flex flex-col flex-1 bg-white">
                  <Link href={`/apartments/${apartment.id}`}>
                    <h3 className="font-bold text-slate-900 text-xl mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors tracking-tight">
                      {apartment.title}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-slate-500 text-sm flex items-center gap-2 font-light">
                      <FaMapMarkerAlt className="text-emerald-500 flex-shrink-0" />
                      {apartment.city}, Sierra Leone
                    </p>
                    <span className="px-2.5 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-lg uppercase border border-slate-100">
                      {apartment.property_type?.replace("_", " ")}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-slate-600 mb-6 pb-6 border-b border-slate-100/80">
                    <span className="flex items-center gap-2 font-medium">
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-primary-500 group-hover:bg-primary-50 transition-colors">
                        <FaBed className="w-3.5 h-3.5" />
                      </div>
                      {apartment.bedrooms} <span className="text-slate-400 font-light">Beds</span>
                    </span>
                    <span className="flex items-center gap-2 font-medium">
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-primary-500 group-hover:bg-primary-50 transition-colors">
                        <FaBath className="w-3.5 h-3.5" />
                      </div>
                      {apartment.bathrooms} <span className="text-slate-400 font-light">Baths</span>
                    </span>
                    {apartment.square_feet ? (
                      <span className="text-slate-400 font-light ml-auto">
                        {apartment.square_feet} ft²
                      </span>
                    ) : apartment.property_type === "APARTMENT_BLOCK" ? (
                      <span className="text-emerald-600 font-bold text-xs ml-auto flex items-center gap-1">
                        <FaBuilding className="w-3 h-3" />
                        {apartment.total_units} units
                      </span>
                    ) : null}
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-3xl font-black text-slate-900 tracking-tight">
                        <span className="text-sm font-medium text-slate-400 mr-1">Le</span>
                        {apartment.price_per_month.toLocaleString()}
                      </span>
                      <span className="text-slate-400 text-sm font-light"> /mo</span>
                    </div>
                    <Link
                      href={`/apartments/${apartment.id}`}
                      className="text-sm font-bold text-white bg-slate-900 px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition-colors shadow-md hover:shadow-lg"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApartmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 pt-32 pb-20 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      }
    >
      <ApartmentsContent />
    </Suspense>
  );
}
