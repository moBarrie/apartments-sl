"use client";

import SearchBar from "./SearchBar";

export default function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop')",
        }}
      />
      {/* Dark overlay – heavier on left so text is readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/85 via-gray-900/70 to-gray-900/30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 bg-green-600/20 border border-green-500/30 text-green-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          🇸🇱 Sierra Leone's Trusted Rental Platform
        </span>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6 max-w-2xl">
          Find Your
          <br />
          <span className="text-green-400">Perfect Home</span>
          <br />
          in Sierra Leone
        </h1>
        <p className="text-lg text-gray-300 max-w-xl mb-10 leading-relaxed">
          Verified apartments in Freetown, Bo, Kenema &amp; Makeni. Instant
          booking, no hidden fees.
        </p>

        {/* Search */}
        <div className="max-w-4xl">
          <SearchBar />
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-8 mt-12">
          {[
            { value: "1,000+", label: "Properties" },
            { value: "4", label: "Cities" },
            { value: "500+", label: "Happy Renters" },
            { value: "98%", label: "Satisfaction" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-black text-green-400">{value}</p>
              <p className="text-sm text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
