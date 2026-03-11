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
} from "react-icons/fa";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"RENTER" | "LANDLORD">("RENTER");
  const [loading, setLoading] = useState(false);
  const [emailConfirmPending, setEmailConfirmPending] = useState(false);

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
          <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-5" />
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
            className="block w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  const inputCls =
    "w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:border-primary-500 focus:bg-white transition-colors font-medium placeholder:text-gray-400";

  const FlagLogo = () => (
    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
      <div className="absolute top-0 left-0 right-0 h-[33.33%] bg-green-600" />
      <div className="absolute top-[33.33%] left-0 right-0 h-[33.33%] bg-white" />
      <div className="absolute bottom-0 left-0 right-0 h-[33.33%] bg-primary-600" />
      <div className="absolute inset-0 flex items-center justify-center">
        <FaBuilding className="text-gray-900 text-sm" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 flex-col justify-between p-14">
        <Link href="/" className="flex items-center gap-3">
          <FlagLogo />
          <span className="text-white text-xl font-bold">
            Apartments<span className="text-green-400">.SL</span>
          </span>
        </Link>
        <div>
          <h2 className="text-5xl font-black text-white leading-tight mb-6">
            List, Rent &amp; <span className="text-green-400">Grow</span> in
            Sierra Leone
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            Create your free account and start finding or listing apartments in
            minutes.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { n: "1,000+", l: "Active Listings" },
              { n: "500+", l: "Happy Renters" },
              { n: "4", l: "Cities" },
              { n: "Free", l: "To Sign Up" },
            ].map(({ n, l }) => (
              <div key={l} className="bg-gray-800 rounded-xl p-4">
                <p className="text-2xl font-black text-green-400">{n}</p>
                <p className="text-gray-400 text-sm">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-gray-600 text-sm">© 2026 Apartments.SL</p>
      </div>

      {/* Right – form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <FlagLogo />
            <span className="font-bold text-gray-900">
              Apartments<span className="text-green-600">.SL</span>
            </span>
          </Link>

          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Create your account
          </h1>
          <p className="text-gray-500 mb-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-green-600 font-semibold hover:underline"
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
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputCls}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
