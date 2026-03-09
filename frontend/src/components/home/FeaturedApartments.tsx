"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import ApartmentCard from "../apartments/ApartmentCard";

export default function FeaturedApartments() {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const response = await api.get("/apartments?sort=newest&limit=6");
        setApartments(response.data.data.apartments);
      } catch (error) {
        console.error("Error fetching apartments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApartments();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card h-80 animate-pulse bg-gray-200" />
        ))}
      </div>
    );
  }

  if (apartments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No apartments found</p>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Featured Apartments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apartments.map((apartment: any) => (
            <ApartmentCard key={apartment.id} apartment={apartment} />
          ))}
        </div>
      </div>
    </div>
  );
}
