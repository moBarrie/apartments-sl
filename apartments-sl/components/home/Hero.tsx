"use client";

import SearchBar from "./SearchBar";

export default function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gray-950">
      {/* Background Image & Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-600/30 blur-[128px] animate-blob mix-blend-screen" />
      <div className="absolute bottom-0 left-20 w-72 h-72 rounded-full bg-emerald-500/20 blur-[128px] animate-blob animation-delay-2000 mix-blend-screen" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full z-10 animate-fade-in-up">
        {/* Badge */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-dark mb-8 group hover:bg-white/10 transition-colors cursor-default">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-white/90 text-sm font-semibold tracking-wide">
            Sierra Leone's Premier Rental Platform
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6 max-w-3xl">
          Discover Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200 animate-gradient">
            Perfect Residence
          </span>
          <br />
          in Sierra Leone
        </h1>
        
        <p className="text-lg sm:text-xl text-slate-300 max-w-xl mb-12 leading-relaxed font-light">
          Exclusive listings. Verified properties. Unmatched quality. 
          Experience a new standard of living in Freetown, Bo, Kenema & Makeni.
        </p>

        {/* Search */}
        <div className="max-w-4xl glass p-2 rounded-3xl shadow-2xl">
          <SearchBar />
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-10 mt-16 pt-8 border-t border-white/10 max-w-3xl">
          {[
            { value: "1,000+", label: "Premium Properties" },
            { value: "4", label: "Major Cities" },
            { value: "100%", label: "Verified Listings" },
          ].map(({ value, label }) => (
            <div key={label} className="group cursor-default">
              <p className="text-4xl font-black text-white mb-1 group-hover:scale-105 transition-transform transform origin-left">
                {value}
              </p>
              <p className="text-sm text-slate-400 tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
