"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaBuilding,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import Logo from "@/components/common/Logo";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"RENTER" | "LANDLORD">("RENTER");
  const [loading, setLoading] = useState(false);
  const [emailConfirmPending, setEmailConfirmPending] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const signUp = useAuthStore((state) => state.signUp);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, fullName, role);
      toast.success("Account created! Welcome to Apartments.SL");
      router.push(
        role === "LANDLORD" ? "/dashboard/landlord" : "/dashboard/renter",
      );
    } catch (error: any) {
      if (error.message === "__EMAIL_CONFIRMATION_REQUIRED__") {
        setEmailConfirmPending(true);
      } else {
        toast.error(error.message || "Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Email confirmation pending screen ────────────────────────────────────
  if (emailConfirmPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 max-w-md w-full text-center shadow-sm">
          <FaCheckCircle className="text-emerald-500 text-5xl mx-auto mb-5" />
          <h1 className="text-2xl font-black text-gray-900 mb-3">
            Check your email
          </h1>
          <p className="text-gray-600 mb-2">We sent a confirmation link to</p>
          <p className="font-bold text-gray-900 mb-6">{email}</p>
          <p className="text-gray-500 text-sm mb-8">
            Click the link in that email to activate your account, then come
            back and sign in.
          </p>
          <Link
            href="/login"
            className="block w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  const inputCls =
    "w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors font-medium placeholder:text-gray-400";

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 flex-col justify-between p-14 relative overflow-hidden">
        {/* Decorative background elements for trust */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />

        <Logo variant="light" />

        <div>
          <h2 className="text-5xl font-black text-white leading-tight mb-6">
            List, Rent &amp; <span className="text-emerald-400">Grow</span> in
            Sierra Leone
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-md">
            Create your free account and start finding or listing apartments in minutes. Join the elite community.
          </p>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            {[
              { n: "1,000+", l: "Properties" },
              { n: "500+", l: "Active Users" },
              { n: "Verified", l: "Listings" },
              { n: "Premium", l: "Support" },
            ].map(({ n, l }) => (
              <div key={l} className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                <p className="text-2xl font-black text-emerald-400">{n}</p>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-slate-600 text-sm z-10">© 2026 Apartments.SL — Elite Real Estate</p>
      </div>

      {/* Right – form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto relative">
        <div className="w-full max-w-md">
          {/* Mobile logo only shown on small screens */}
          <div className="lg:hidden mb-12">
            <Logo variant="dark" />
          </div>


          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Create your account
          </h1>
          <p className="text-gray-500 mb-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-emerald-600 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
            {(["RENTER", "LANDLORD"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
                  role === r
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {r === "RENTER" ? "🏠 I want to Rent" : "🔑 I want to List"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
