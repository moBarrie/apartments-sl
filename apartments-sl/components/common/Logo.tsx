"use client";

import Link from "next/link";
import { FaBuilding } from "react-icons/fa";

interface LogoProps {
  variant?: "light" | "dark";
  showText?: boolean;
  className?: string;
}

export default function Logo({ variant = "dark", showText = true, className = "" }: LogoProps) {
  const isLight = variant === "light";

  return (
    <Link href="/" className={`flex items-center gap-4 group ${className}`}>
      {/* Abstract Architectural Icon */}
      <div className="relative w-12 h-12 flex-shrink-0 group-hover:scale-105 transition-all duration-500">
        {/* Background Base */}
        <div className={`absolute inset-0 rounded-[14px] rotate-[10deg] group-hover:rotate-0 transition-transform duration-700 ${
          isLight ? "bg-white/10" : "bg-slate-100"
        }`} />
        
        {/* Main Icon Container */}
        <div className={`absolute inset-0 rounded-[14px] flex items-center justify-center shadow-xl border overflow-hidden ${
          isLight 
            ? "bg-slate-900 border-white/10" 
            : "bg-white border-slate-200"
        }`}>
          {/* Subtle Gradient Accent */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-500/10 to-transparent" />
          
          {/* The Icon */}
          <div className="relative z-10">
            <svg 
              viewBox="0 0 24 24" 
              className={`w-6 h-6 ${isLight ? "text-white" : "text-slate-900"}`}
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            {/* Small accent dot representing the 'dot' in .SL */}
            <div className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`text-2xl font-black leading-tight tracking-tight ${
            isLight ? "text-white" : "text-slate-900"
          }`}>
            Apartments<span className="text-emerald-500">.SL</span>
          </span>
          <span className={`text-[10px] font-bold tracking-[0.25em] uppercase ${
            isLight ? "text-slate-400" : "text-slate-500"
          }`}>
            Elite Real Estate
          </span>
        </div>
      )}
    </Link>
  );
}
