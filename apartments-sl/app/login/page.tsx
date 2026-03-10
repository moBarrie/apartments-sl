"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import { FaEnvelope, FaLock, FaBuilding } from "react-icons/fa";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { signIn } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back!");
      const role = useAuthStore.getState().user?.role;
      router.push(
        role === "LANDLORD" ? "/dashboard/landlord" : "/dashboard/renter",
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-primary-500 focus:bg-white transition-colors font-medium placeholder:text-gray-400";

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
      {/* Left – branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 flex-col justify-between p-14">
        <Link href="/" className="flex items-center gap-3">
          <FlagLogo />
          <span className="text-white text-xl font-bold">
            Apartments<span className="text-green-400">.SL</span>
          </span>
        </Link>
        <div>
          <h2 className="text-5xl font-black text-white leading-tight mb-6">
            Find Your <span className="text-green-400">Home</span> in Sierra
            Leone
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Join thousands of renters finding quality homes across Freetown, Bo,
            Kenema &amp; Makeni.
          </p>
        </div>
        <p className="text-gray-600 text-sm">© 2026 Apartments.SL</p>
      </div>

      {/* Right – form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <FlagLogo />
            <span className="font-bold text-gray-900">
              Apartments<span className="text-green-600">.SL</span>
            </span>
          </Link>

          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-gray-500 mb-8">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-green-600 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
