"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Logo from "@/components/common/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { signIn } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back!");
      const role = useAuthStore.getState().profile?.role;
      router.push(
        role === "ADMIN"
          ? "/dashboard/admin"
          : role === "LANDLORD"
          ? "/dashboard/landlord"
          : "/dashboard/renter",
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full pl-11 pr-12 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium placeholder:text-slate-400 shadow-sm";

  return (
    <div className="min-h-screen flex">
      {/* Left – branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 flex-col justify-between p-14 relative overflow-hidden">
        {/* Decorative background elements for trust */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-32 -mb-32" />

        <Logo variant="light" />

        <div>
          <h2 className="text-5xl font-black text-white leading-tight mb-6">
            Find Your <span className="text-emerald-400">Home</span> in Sierra
            Leone
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            Join thousands of renters finding quality, verified homes across Freetown, Bo,
            Kenema &amp; Makeni.
          </p>
        </div>
        <p className="text-slate-600 text-sm z-10">© 2026 Apartments.SL — Elite Real Estate</p>
      </div>

      {/* Right – form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white relative">
        <div className="w-full max-w-md">
          {/* Mobile logo only shown on small screens */}
          <div className="lg:hidden mb-12">
            <Logo variant="dark" />
          </div>


          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-gray-500 mb-8">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-emerald-600 font-semibold hover:underline"
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
                  className="text-sm text-emerald-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
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


            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 active:scale-95 flex items-center justify-center"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign in to Dashboard"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
