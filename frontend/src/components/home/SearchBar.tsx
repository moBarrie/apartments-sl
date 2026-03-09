"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiMapPin } from "react-icons/fi";

export default function SearchBar() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (city) params.append("city", city);
    if (minPrice) params.append("minPrice", minPrice);
    if (bedrooms) params.append("bedrooms", bedrooms);

    router.push(`/apartments?${params.toString()}`);
  };

  return (
    <div className="relative -mt-8 z-10">
      <div className="card p-6 max-w-5xl mx-auto">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {/* City */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input pl-10"
              >
                <option value="">All Cities</option>
                <option value="Freetown">Freetown</option>
                <option value="Bo">Bo</option>
                <option value="Kenema">Kenema</option>
                <option value="Makeni">Makeni</option>
              </select>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Price
            </label>
            <input
              type="number"
              placeholder="$50"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="input"
            />
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bedrooms
            </label>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="input"
            >
              <option value="">Any</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4+</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              <FiSearch />
              <span>Search</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
