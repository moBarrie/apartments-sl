"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FaBed, FaBath, FaMapMarkerAlt, FaArrowRight } from "react-icons/fa";

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden animate-pulse shadow-sm"
          >
            <div className="h-64 bg-slate-200" />
            <div className="p-8 space-y-4">
              <div className="h-5 bg-slate-200 rounded-full w-3/4" />
              <div className="h-4 bg-slate-200 rounded-full w-1/2" />
              <div className="h-5 bg-slate-200 rounded-full w-1/3 mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (apartments.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-transparent" />
        <div className="relative z-10">
          <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <FaBed className="text-slate-400 text-3xl" />
          </div>
          <p className="text-slate-900 font-bold text-xl mb-2 tracking-tight">Empty Collection</p>
          <p className="text-slate-500 font-light max-w-sm mx-auto">
            Be the first to feature your premium property in our exclusive marketplace.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
      {apartments.map((apartment: any) => (
        <Link
          key={apartment.id}
          href={`/apartments/${apartment.id}`}
          className="group block bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500"
        >
          {/* Image Container */}
          <div className="relative h-64 bg-slate-100 overflow-hidden">
            {apartment.apartment_images?.[0]?.url ? (
              <img
                src={apartment.apartment_images[0].url}
                alt={apartment.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-50">
                <FaBed className="text-slate-300 text-5xl" />
              </div>
            )}
            
            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            
            <span className="absolute top-4 left-4 glass-dark text-white text-[10px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full backdrop-blur-md">
              Featured
            </span>
          </div>

          {/* Details */}
          <div className="p-8 relative bg-white">
            <h3 className="font-bold text-slate-900 text-xl mb-2 line-clamp-1 group-hover:text-green-600 transition-colors tracking-tight">
              {apartment.title}
            </h3>
            
            <p className="text-slate-500 text-sm flex items-center gap-2 mb-6 font-light">
              <FaMapMarkerAlt className="text-green-500 flex-shrink-0" />
              {apartment.city}, Sierra Leone
            </p>
            
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
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  <span className="text-sm font-medium text-slate-400 mr-1">Le</span>
                  {apartment.price_per_month?.toLocaleString() || 0}
                </span>
                <span className="text-slate-400 text-sm font-light"> /mo</span>
              </div>
              
              <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition-all duration-300 transform group-hover:translate-x-1">
                <FaArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
