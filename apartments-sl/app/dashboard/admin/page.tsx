"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import {
  FaCheck,
  FaTimes,
  FaHome,
  FaEye,
  FaSearch,
  FaFilter,
  FaBuilding,
  FaUser,
  FaComments,
} from "react-icons/fa";

interface Apartment {
  id: string;
  title: string;
  city: string;
  status: string;
  property_type: string;
  price_per_month: number;
  landlord_id: string;
  created_at: string;
  apartment_images: { url: string }[];
  users: {
    full_name: string;
    email: string;
  };
}

export default function AdminDashboard() {
  const { user, profile, isLoading } = useAuthStore();
  const router = useRouter();
  const supabase = createClient();

  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");

  useEffect(() => {
    if (isLoading) return;
    
    // Security check: Role must be ADMIN AND email must be authorized
    const isAuthorizedEmail = profile?.email === "medalbarrie@gmail.com";
    
    if (!user || profile?.role !== "ADMIN" || !isAuthorizedEmail) {
      toast.error("Unauthorized access to review panel");
      router.push("/");
      return;
    }
    fetchPending();
  }, [user, profile, isLoading, filter]);

  const fetchPending = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("apartments")
        .select(`
          *,
          apartment_images(url),
          users:landlord_id(full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (filter !== "ALL") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setApartments(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("apartments")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Listing ${status.toLowerCase()} successfully`);
      fetchPending();
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    }
  };

  if (loading && apartments.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 flex justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Listing Review</h1>
              <p className="text-slate-500 font-light">Audit and approve marketplace properties</p>
            </div>
            
            <Link 
              href="/dashboard/admin/messages"
              className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm shadow-slate-100"
            >
              <FaComments className="text-emerald-500" />
              Messaging Hub
            </Link>
          </div>

          <div className="flex items-center gap-3 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            {["PENDING", "APPROVED", "REJECTED", "ALL"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filter === f
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {apartments.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-slate-100">
              <FaCheck className="text-emerald-500 text-3xl" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Queue Clear</h2>
            <p className="text-slate-500 font-light">No properties currently require review in this category.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {apartments.map((apt) => (
              <div key={apt.id} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row gap-8">
                {/* Image Section */}
                <div className="relative w-full lg:w-72 h-48 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner">
                  {apt.apartment_images?.[0]?.url ? (
                    <Image src={apt.apartment_images[0].url} alt={apt.title} fill unoptimized className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaHome className="text-slate-300 text-4xl" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md ${
                      apt.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                      apt.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                      {apt.property_type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Posted {new Date(apt.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-900 mb-2 line-clamp-1">{apt.title}</h3>
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-6 font-medium">
                    <FaUser className="text-slate-300 w-3.5 h-3.5" />
                    <span>{apt.users.full_name} ({apt.users.email})</span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/apartments/${apt.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95"
                    >
                      <FaEye /> View Property
                    </Link>
                    
                    {apt.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => updateStatus(apt.id, 'APPROVED')}
                          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                        >
                          <FaCheck /> Approve Listing
                        </button>
                        <button
                          onClick={() => updateStatus(apt.id, 'REJECTED')}
                          className="inline-flex items-center gap-2 px-6 py-2.5 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-50 transition-all active:scale-95"
                        >
                          <FaTimes /> Reject
                        </button>
                      </>
                    )}

                    {apt.status !== 'PENDING' && (
                       <button
                       onClick={() => updateStatus(apt.id, 'PENDING')}
                       className="inline-flex items-center gap-2 px-6 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
                     >
                       Revert to Pending
                     </button>
                    )}
                  </div>
                </div>

                {/* Price Tag */}
                <div className="lg:w-48 lg:border-l border-slate-100 lg:pl-8 flex flex-col justify-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price / mo</p>
                  <p className="text-2xl font-black text-emerald-600">Le {apt.price_per_month.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) }
      </div>
    </div>
  );
}
