"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FaBed, FaBath, FaMapMarkerAlt } from "react-icons/fa";

interface Apartment {
  id: string;
  title: string;
  city: string;
  price_per_month: number;
  bedrooms: number;
  bathrooms: number;
  apartment_images: { url: string }[];
}

export default function FeaturedApartments() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApartments() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("apartments")
        .select(
          `
          *,
          apartment_images(url, is_primary)
        `,
        )
        .eq("status", "APPROVED")
        .order("created_at", { ascending: false })
        .limit(6);

      if (!error && data) {
        setApartments(data);
      }
      setLoading(false);
    }

    fetchApartments();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
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
    );
  }

  if (apartments.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FaBed className="text-gray-400 text-2xl" />
        </div>
        <p className="text-gray-700 font-semibold mb-1">No listings yet</p>
        <p className="text-gray-400 text-sm">
          Be among the first to list your property!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {apartments.map((apartment: any) => (
        <Link
          key={apartment.id}
          href={`/apartments/${apartment.id}`}
          className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          {/* Image */}
          <div className="relative h-52 bg-gray-100 overflow-hidden">
            {apartment.apartment_images?.[0]?.url ? (
              <img
                src={apartment.apartment_images[0].url}
                alt={apartment.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FaBed className="text-gray-300 text-5xl" />
              </div>
            )}
            <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              Featured
            </span>
          </div>

          {/* Info */}
          <div className="p-5">
            <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
              {apartment.title}
            </h3>
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
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <span className="text-2xl font-black text-gray-900">
                  Le {apartment.price_per_month?.toLocaleString() || 0}
                </span>
                <span className="text-gray-500 text-sm"> /mo</span>
              </div>
              <span className="text-primary-600 text-sm font-semibold group-hover:underline">
                View →
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
