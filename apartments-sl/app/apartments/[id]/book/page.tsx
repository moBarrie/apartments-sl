"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaShieldAlt,
  FaCheckCircle,
  FaHome,
} from "react-icons/fa";

interface Apartment {
  id: string;
  title: string;
  price_per_month: number;
  deposit_amount: number;
  apartment_images: { url: string }[];
  city: string;
  address: string;
}

function BookingContent() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const supabase = createClient();

  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [startDate, setStartDate] = useState("");
  const [durationMonths, setDurationMonths] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");

  useEffect(() => {
    if (user && profile?.role === "LANDLORD") {
      toast.error("Landlords cannot book properties");
      router.push("/");
      return;
    }
    fetchApartment();
  }, [params.id, user, profile]);

  const fetchApartment = async () => {
    try {
      const { data, error } = await supabase
        .from("apartments")
        .select(`*, apartment_images(url)`)
        .eq("id", params.id)
        .single();

      if (error) throw error;
      setApartment(data);
    } catch (err) {
      toast.error("Property not found");
      router.push("/apartments");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to continue");
      router.push("/login");
      return;
    }

    if (!startDate) {
      toast.error("Please select a move-in date");
      return;
    }

    setSubmitting(true);
    try {
      const start = new Date(startDate);
      const end = new Date(startDate);
      end.setMonth(start.getMonth() + Number(durationMonths));

      const totalAmount = (apartment!.price_per_month * durationMonths) + apartment!.deposit_amount;

      const { data, error } = await supabase.from("bookings").insert({
        apartment_id: apartment!.id,
        renter_id: user.id,
        start_date: startDate,
        end_date: end.toISOString().split("T")[0],
        total_amount: totalAmount,
        deposit_amount: apartment!.deposit_amount,
        status: "PENDING",
        special_requests: specialRequests.trim() || null,
      }).select("id").single();

      if (error) throw error;

      toast.success("Reservation request sent!");
      router.push(`/bookings/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 flex justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!apartment) return null;

  const totalMonthly = apartment.price_per_month * durationMonths;
  const totalDue = totalMonthly + apartment.deposit_amount;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            href={`/apartments/${params.id}`}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Complete Reservation</h1>
            <p className="text-slate-500 font-light">Secure your new residence in seconds</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <FaCalendarAlt className="text-emerald-500" />
                Schedule Your Residency
              </h2>

              <form onSubmit={handleBooking} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Planned Move-In Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-5 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Lease Duration (Months)
                  </label>
                  <select
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value))}
                    className="w-full px-5 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all outline-none"
                  >
                    {[1, 2, 3, 6, 12, 18, 24].map((m) => (
                      <option key={m} value={m}>
                        {m} {m === 1 ? "Month" : "Months"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any specific requirements or questions for the proprietor?"
                    className="w-full px-5 py-4 border border-slate-200 rounded-2xl bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all outline-none resize-none"
                  />
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <FaShieldAlt className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900 mb-0.5">Secure Transaction</p>
                    <p className="text-xs text-emerald-700 leading-relaxed font-medium">
                      Your request is shared directly with the verified proprietor. Terms are finalized during contract signing.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Initialize Reservation"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm overflow-hidden">
               <div className="relative h-40 -mx-6 -mt-6 mb-6">
                 {apartment.apartment_images?.[0]?.url ? (
                   <Image src={apartment.apartment_images[0].url} alt={apartment.title} fill className="object-cover" />
                 ) : (
                   <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                     <FaHome className="text-slate-300 text-3xl" />
                   </div>
                 )}
               </div>
               
               <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{apartment.title}</h3>
               <p className="text-slate-500 text-xs font-medium mb-6">
                 {apartment.address}, {apartment.city}
               </p>

               <div className="space-y-3 pt-6 border-t border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Monthly Rent</span>
                    <span className="font-bold text-slate-900">Le {apartment.price_per_month.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-bold text-slate-900">{durationMonths} mo</span>
                  </div>
                  <div className="flex justify-between text-sm pb-3">
                    <span className="text-slate-500">Security Deposit</span>
                    <span className="font-bold text-slate-900">Le {apartment.deposit_amount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Investment</span>
                    <span className="text-2xl font-black text-emerald-600">Le {totalDue.toLocaleString()}</span>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-3 text-slate-400 px-4">
              <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
              <p className="text-[10px] font-bold uppercase tracking-wider leading-tight">
                Elite verification standards applied to this residence
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 pt-32 flex justify-center"><div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" /></div>}>
      <BookingContent />
    </Suspense>
  );
}
