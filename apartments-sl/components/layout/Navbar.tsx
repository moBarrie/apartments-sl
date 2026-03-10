"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  FaBars,
  FaTimes,
  FaUser,
  FaBuilding,
  FaSearch,
  FaArrowRight,
} from "react-icons/fa";
import { useAuthStore } from "@/store/authStore";

// Modern Sierra Leone Flag Logo
function SierraLeoneFlag() {
  return (
    <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
      <div className="absolute top-0 left-0 right-0 h-[33.33%] bg-gradient-to-r from-green-500 to-green-600"></div>
      <div className="absolute top-[33.33%] left-0 right-0 h-[33.33%] bg-white"></div>
      <div className="absolute bottom-0 left-0 right-0 h-[33.33%] bg-gradient-to-r from-primary-500 to-primary-600"></div>
      <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]">
        <FaBuilding className="w-6 h-6 text-gray-900 drop-shadow-lg" />
      </div>
    </div>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { profile, user, signOut } = useAuthStore();

  const navLinkClass =
    "inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-primary-700 transition-colors px-4 py-2.5 rounded-xl hover:bg-primary-50";
  const ghostButtonClass =
    "inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-primary-800 border border-primary-200 bg-primary-50 hover:bg-primary-100 hover:border-primary-300 transition-all";
  const primaryButtonClass =
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200"
          : "bg-white/95 border-b border-gray-100"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <SierraLeoneFlag />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900 leading-tight">
                Apartments<span className="text-green-600">.SL</span>
              </span>
              <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">
                Find Your Home
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center p-1 rounded-2xl border border-gray-200 bg-white shadow-sm">
              <Link href="/apartments" className={navLinkClass}>
                <FaSearch className="w-4 h-4" />
                <span>Browse</span>
              </Link>

              {user && profile && (
                <Link
                  href={
                    profile.role === "LANDLORD"
                      ? "/dashboard/landlord"
                      : "/dashboard/renter"
                  }
                  className={navLinkClass}
                >
                  <FaBuilding className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              )}
            </div>

            {user && profile ? (
              <div className="flex items-center gap-3">
                <Link href="/profile" className={ghostButtonClass}>
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-primary-500 rounded-lg flex items-center justify-center shadow-sm">
                    <FaUser className="w-4 h-4 text-white" />
                  </div>
                  <span className="max-w-[120px] truncate">
                    {profile.full_name}
                  </span>
                </Link>

                <Link href="/apartments" className={primaryButtonClass}>
                  <span>Explore Homes</span>
                  <FaArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={signOut}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 border border-red-100 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className={ghostButtonClass}>
                  Log In
                </Link>
                <Link href="/signup" className={primaryButtonClass}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? (
              <FaTimes className="w-6 h-6 text-gray-900" />
            ) : (
              <FaBars className="w-6 h-6 text-gray-900" />
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="lg:hidden py-5 border-t border-gray-200 bg-white/95 backdrop-blur-xl animate-slide-in-right">
            <div className="flex flex-col gap-3">
              <Link
                href="/apartments"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 text-gray-700 font-semibold transition-all"
              >
                <FaSearch className="w-4 h-4" />
                <span>Browse Apartments</span>
              </Link>

              {user && profile ? (
                <>
                  <Link
                    href={
                      profile.role === "LANDLORD"
                        ? "/dashboard/landlord"
                        : "/dashboard/renter"
                    }
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 text-gray-700 font-semibold transition-all"
                  >
                    <FaBuilding className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 text-gray-700 font-semibold transition-all"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-primary-500 rounded-lg flex items-center justify-center shadow-md">
                      <FaUser className="w-4 h-4 text-white" />
                    </div>
                    <span>{profile.full_name}</span>
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition-all text-left"
                  >
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 rounded-xl border border-primary-200 bg-primary-50 hover:bg-primary-100 text-primary-800 font-semibold transition-all text-center"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all text-center shadow-lg"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
