"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";

const CITIES = ["Freetown", "Bo", "Kenema", "Makeni"];

export default function SearchBar() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    city: "",
    minPrice: "",
    bedrooms: "",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filters.city) params.append("city", filters.city);
    if (filters.minPrice) params.append("minPrice", filters.minPrice);
    if (filters.bedrooms) params.append("bedrooms", filters.bedrooms);
    router.push(`/apartments?${params.toString()}`);
  };

  const fieldCls =
    "w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-primary-500 focus:bg-white text-gray-900 font-medium transition-colors";

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white rounded-2xl shadow-2xl p-4 md:p-5"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Location
          </label>
          <select
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className={fieldCls}
          >
            <option value="">All Cities</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Min Price (Le)
          </label>
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) =>
              setFilters({ ...filters, minPrice: e.target.value })
            }
            placeholder="Any"
            className={fieldCls}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Bedrooms
          </label>
          <select
            value={filters.bedrooms}
            onChange={(e) =>
              setFilters({ ...filters, bedrooms: e.target.value })
            }
            className={fieldCls}
          >
            <option value="">Any</option>
            <option value="1">1+ Beds</option>
            <option value="2">2+ Beds</option>
            <option value="3">3+ Beds</option>
            <option value="4">4+ Beds</option>
          </select>
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
        >
          <FaSearch />
          Search
        </button>
      </div>
    </form>
  );
}
