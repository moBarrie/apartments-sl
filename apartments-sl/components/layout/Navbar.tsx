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
import { usePathname } from "next/navigation";
import Logo from "@/components/common/Logo";
import { useAuthStore } from "@/store/authStore";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { profile, user, signOut } = useAuthStore();
  const pathname = usePathname();

  // Don't show Navbar on auth pages
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  if (isAuthPage) return null;

  const navLinkClass =
    "inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/5";
    
  const ghostButtonClass =
    "inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white border border-white/5 bg-white/5 hover:bg-white/10 transition-all backdrop-blur-md";
    
  const primaryButtonClass =
    "inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-[0_0_20px_rgba(5,150,105,0.3)] hover:shadow-[0_0_30px_rgba(5,150,105,0.5)] transition-all";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-slate-950/80 backdrop-blur-2xl shadow-2xl border-b border-white/5 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Logo variant="light" />


          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center p-1.5 rounded-full border border-white/10 glass-dark shadow-inner">
              <Link href="/apartments" className={navLinkClass}>
                <FaSearch className="w-3.5 h-3.5" />
                <span>Search</span>
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
                  <FaBuilding className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>
              )}
            </div>

            {user && profile ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
                <Link href="/profile" className={ghostButtonClass}>
                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mr-2 shadow-sm">
                    <FaUser className="w-3 h-3 text-white" />
                  </div>
                  <span className="max-w-[120px] truncate">
                    {profile.full_name}
                  </span>
                </Link>

                <button
                  onClick={signOut}
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-medium text-red-400 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
                <Link href="/login" className={ghostButtonClass}>
                  Sign In
                </Link>
                <Link href="/signup" className={primaryButtonClass}>
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className={`lg:hidden p-3 rounded-full hover:bg-white/10 transition-colors ${scrolled ? 'text-white' : 'text-white'}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? (
              <FaTimes className="w-5 h-5" />
            ) : (
              <FaBars className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 mt-2 mx-4 rounded-3xl border border-white/10 bg-slate-950/95 backdrop-blur-3xl shadow-2xl p-6 animate-fade-in-up">
            <div className="flex flex-col gap-4">
              <Link
                href="/apartments"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
              >
                <FaSearch className="w-4 h-4 text-green-400" />
                <span>Search Properties</span>
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
                    className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                  >
                    <FaBuilding className="w-4 h-4 text-green-400" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
                      <FaUser className="w-3 h-3 text-white" />
                    </div>
                    <span>{profile.full_name}</span>
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 font-medium transition-all"
                  >
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-medium text-center hover:bg-white/10 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    className="px-5 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-xl text-center shadow-lg transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
