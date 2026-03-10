"use client";

import { useEffect, useState } from "react";
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
  apartment_images: { url: string }[];
}

export default function ApartmentsPage() {
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

      if (city) query = query.ilike("city", `%${city}%`);
      if (minPrice) query = query.gte("price_per_month", parseFloat(minPrice));
      if (bedrooms) query = query.gte("bedrooms", parseInt(bedrooms));

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
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-black text-gray-900 mb-1">
            Find Your Home
          </h1>
          <p className="text-gray-500">
            <span className="font-semibold text-primary-600">
              {apartments.length}
            </span>{" "}
            {apartments.length === 1 ? "property" : "properties"} available
            {city && (
              <>
                {" "}
                in <span className="font-semibold text-gray-900">{city}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
              >
                <div className="h-52 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : apartments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <FaBed className="text-gray-400 text-2xl" />
            </div>
            <p className="text-gray-900 text-xl font-bold mb-2">
              No properties found
            </p>
            <p className="text-gray-500 mb-6">
              Try adjusting your filters or browse all properties
            </p>
            <Link
              href="/apartments"
              className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
            >
              View All Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apartments.map((apartment) => (
              <div
                key={apartment.id}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <Link href={`/apartments/${apartment.id}`}>
                  <div className="relative h-52 bg-gray-100 overflow-hidden">
                    {apartment.apartment_images?.[0]?.url ? (
                      <Image
                        src={apartment.apartment_images[0].url}
                        alt={apartment.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaBed className="text-gray-300 text-5xl" />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(apartment.id);
                      }}
                      className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                    >
                      {favorites.has(apartment.id) ? (
                        <FaHeart className="text-red-500 w-4 h-4" />
                      ) : (
                        <FaRegHeart className="text-gray-500 w-4 h-4" />
                      )}
                    </button>
                  </div>
                </Link>

                <div className="p-5">
                  <Link href={`/apartments/${apartment.id}`}>
                    <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                      {apartment.title}
                    </h3>
                  </Link>
                  <p className="text-gray-500 text-sm flex items-center gap-1.5 mb-4">
                    <FaMapMarkerAlt className="text-green-500 flex-shrink-0" />
                    {apartment.city}, Sierra Leone
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1.5">
                      <FaBed className="text-primary-500" />
                      {apartment.bedrooms} bd
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FaBath className="text-primary-500" />
                      {apartment.bathrooms} ba
                    </span>
                    {apartment.square_feet && (
                      <span className="text-gray-400">
                        {apartment.square_feet} ft²
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-2xl font-black text-gray-900">
                        Le {apartment.price_per_month.toLocaleString()}
                      </span>
                      <span className="text-gray-500 text-sm"> /mo</span>
                    </div>
                    <Link
                      href={`/apartments/${apartment.id}`}
                      className="text-sm font-semibold text-primary-600 hover:underline"
                    >
                      View →
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
