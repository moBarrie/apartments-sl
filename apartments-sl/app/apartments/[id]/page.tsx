"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import {
  FaBed,
  FaBath,
  FaMapMarkerAlt,
  FaRulerCombined,
  FaCalendar,
  FaHeart,
  FaRegHeart,
  FaUser,
  FaPhone,
  FaPaperPlane,
  FaShieldAlt,
  FaCheckCircle,
  FaBuilding,
} from "react-icons/fa";

interface Apartment {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number | null;
  price_per_month: number;
  deposit_amount: number;
  available_from: string;
  lease_duration_months: number | null;
  property_type: string;
  total_units: number;
  apartment_images: { url: string; caption: string | null }[];
  landlord_id: string;
  users: {
    full_name: string;
    avatar_url: string | null;
  };
}

export default function ApartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const supabase = createClient();

  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Enquiry form state
  const [enquiryName, setEnquiryName] = useState("");
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [enquirySending, setEnquirySending] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);

  useEffect(() => {
    fetchApartment();
    if (user) checkFavorite();
  }, [params.id]);

  // Pre-fill enquiry name from profile
  useEffect(() => {
    if (profile?.full_name) setEnquiryName(profile.full_name);
    if (profile?.phone) setEnquiryPhone(profile.phone);
  }, [profile]);

  const fetchApartment = async () => {
    try {
      const { data, error } = await supabase
        .from("apartments")
        .select(
          `
          *,
          apartment_images(url, caption),
          users!apartments_landlord_id_fkey(full_name, avatar_url)
        `,
        )
        .eq("id", params.id)
        .single();

      if (error) throw error;
      setApartment(data);

      // Increment view count
      await supabase.rpc("increment_apartment_views", {
        apartment_id: params.id,
      });
    } catch (error: any) {
      console.error("Error fetching apartment:", error);
      toast.error("Apartment not found");
      router.push("/apartments");
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user!.id)
        .eq("apartment_id", params.id)
        .single();

      setIsFavorite(!!data);
    } catch (error) {
      // Not a favorite
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error("Please sign in to save favorites");
      router.push("/login");
      return;
    }

    try {
      if (isFavorite) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("apartment_id", params.id);

        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await supabase
          .from("favorites")
          .insert({ user_id: user.id, apartment_id: params.id });

        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (error: any) {
      toast.error("Failed to update favorites");
    }
  };

  const handleBooking = () => {
    if (!user) {
      toast.error("Please sign in to book");
      router.push("/login");
      return;
    }

    if (profile?.role === "LANDLORD") {
      toast.error("Landlords cannot book apartments");
      return;
    }

    router.push(`/apartments/${params.id}/book`);
  };

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to send an enquiry");
      router.push("/login");
      return;
    }
    if (!apartment) return;
    if (!enquiryMessage.trim()) {
      toast.error("Please write a message");
      return;
    }

    setEnquirySending(true);
    try {
      const content = `[Enquiry: ${apartment.title}]\nName: ${enquiryName}\nPhone: ${enquiryPhone || "Not provided"}\n\n${enquiryMessage.trim()}`;

      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        recipient_id: apartment.landlord_id,
        apartment_id: apartment.id,
        content,
      });

      if (error) throw error;

      setEnquirySent(true);
      toast.success("Enquiry sent to the landlord!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send enquiry");
    } finally {
      setEnquirySending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse">
          <div className="h-[500px] bg-slate-200 rounded-[2rem] mb-4" />
          <div className="grid grid-cols-4 gap-4 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-10 bg-slate-200 rounded-full w-2/3" />
              <div className="h-5 bg-slate-200 rounded-full w-1/3" />
              <div className="h-40 bg-slate-200 rounded-[2rem] mt-8" />
            </div>
            <div className="h-80 bg-slate-200 rounded-[2rem]" />
          </div>
        </div>
      </div>
    );
  }

  if (!apartment) return null;

  const images =
    apartment.apartment_images.length > 0
      ? apartment.apartment_images
      : [{ url: "/placeholder-apartment.jpg", caption: null }];

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
        {/* Image Gallery Header */}
        <div className="mb-12">
          <div className="relative h-[400px] md:h-[550px] bg-slate-950 rounded-[2rem] overflow-hidden mb-4 shadow-2xl">
            <Image
              src={images[selectedImage].url}
              alt={apartment.title}
              fill
              className="object-cover transition-transform duration-1000 select-none"
              priority
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
            
            <button
              onClick={toggleFavorite}
              className="absolute top-6 right-6 w-12 h-12 glass rounded-full shadow-lg flex items-center justify-center hover:bg-white/90 transition-all z-10 group"
            >
              {isFavorite ? (
                <FaHeart className="text-red-500 text-xl transform scale-110 transition-transform" />
              ) : (
                <FaRegHeart className="text-slate-600 text-xl group-hover:scale-110 transition-transform" />
              )}
            </button>
            <div className="absolute bottom-6 left-6 glass-dark px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
              <p className="text-white font-medium text-sm capitalize">
                <FaBuilding className="inline text-emerald-400 mr-2 -mt-0.5" />
                {apartment.property_type?.replace("_", " ").toLowerCase()}
              </p>
            </div>
          </div>
          
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative h-24 w-36 flex-shrink-0 rounded-2xl overflow-hidden transition-all duration-300 ${
                    selectedImage === idx
                      ? "ring-4 ring-emerald-500 ring-offset-2 scale-105 shadow-xl"
                      : "opacity-60 hover:opacity-100 hover:scale-105"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`View ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title card */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 md:p-10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100px] pointer-events-none" />
              
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-widest rounded-lg mb-4">
                Exclusive Listing
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
                {apartment.title}
              </h1>
              <p className="text-slate-500 text-lg flex items-center gap-2 mb-8 font-light">
                <FaMapMarkerAlt className="text-green-500" />
                {apartment.address}, {apartment.city}, Sierra Leone
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: FaBed, label: "Bedrooms", value: apartment.bedrooms },
                  {
                    icon: FaBath,
                    label: "Bathrooms",
                    value: apartment.bathrooms,
                  },
                  ...(apartment.square_feet
                    ? [
                        {
                          icon: FaRulerCombined,
                          label: "Area",
                          value: `${apartment.square_feet} ft²`,
                        },
                      ]
                    : []),
                  {
                    icon: FaCalendar,
                    label: "Available",
                    value: new Date(
                      apartment.available_from,
                    ).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }),
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center group hover:bg-white hover:border-slate-200 hover:shadow-md transition-all duration-300"
                  >
                    <Icon className="text-emerald-500 text-2xl mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">
                      {label}
                    </p>
                    <p className="font-bold text-slate-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 md:p-10 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">
                About this residence
              </h2>
              <div className="prose prose-slate prose-lg max-w-none font-light leading-relaxed text-slate-600">
                <p className="whitespace-pre-line">{apartment.description}</p>
              </div>
            </div>

            {/* Enquiry Component */}
            <div className="bg-slate-900 rounded-[2rem] border border-slate-800 p-8 md:p-10 shadow-2xl relative overflow-hidden">
               {/* Decorative background for dark component */}
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-600/20 rounded-full blur-[100px] pointer-events-none" />

              <h2 className="text-2xl font-black text-white mb-8 tracking-tight relative z-10">
                Contact the Proprietor
              </h2>
              
              <div className="flex items-center gap-5 mb-8 relative z-10 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                <div className="w-16 h-16 bg-slate-800 border-2 border-white/10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
                  {apartment.users.avatar_url ? (
                    <Image
                      src={apartment.users.avatar_url}
                      alt={apartment.users.full_name}
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-slate-400 text-2xl" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-white text-lg tracking-wide">
                    {apartment.users.full_name}
                  </p>
                  <p className="text-green-400 text-sm font-medium">Verified Property Owner <FaShieldAlt className="inline ml-1 -mt-0.5" /></p>
                </div>
              </div>

              <div className="relative z-10">
                {!user ? (
                  <div className="text-center py-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                    <p className="text-slate-300 text-sm mb-4 font-light">
                      Authentication required to connect with the owner.
                    </p>
                    <Link
                      href={`/login?redirectTo=/apartments/${params.id}`}
                      className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] tracking-wide"
                    >
                      Sign In to Enquire
                    </Link>
                  </div>
                ) : enquirySent ? (
                  <div className="text-center py-10 bg-green-500/10 rounded-2xl border border-green-500/20 backdrop-blur-sm">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaPaperPlane className="text-green-400 text-3xl" />
                    </div>
                    <p className="font-black text-white text-xl mb-2 tracking-tight">Transmission Successful</p>
                    <p className="text-slate-300 font-light max-w-sm mx-auto">
                      The proprietor has been notified and will respond to your registered email shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleEnquiry} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                          Applicant Name
                        </label>
                        <input
                          required
                          type="text"
                          value={enquiryName}
                          onChange={(e) => setEnquiryName(e.target.value)}
                          placeholder="Full Name"
                          className="w-full px-5 py-3.5 border border-white/10 rounded-xl bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-colors backdrop-blur-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                          Contact Number
                        </label>
                        <div className="relative">
                          <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                          <input
                            type="tel"
                            value={enquiryPhone}
                            onChange={(e) => setEnquiryPhone(e.target.value)}
                            placeholder="+232 77 000 000"
                            className="w-full pl-11 pr-5 py-3.5 border border-white/10 rounded-xl bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-colors backdrop-blur-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                        Inquiry Message <span className="text-green-400">*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={enquiryMessage}
                        onChange={(e) => setEnquiryMessage(e.target.value)}
                        placeholder="Detail your interest or scheduling preferences..."
                        className="w-full px-5 py-4 border border-white/10 rounded-2xl bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-colors backdrop-blur-sm resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={enquirySending}
                      className="w-full py-4 mt-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_10px_40px_rgba(16,185,129,0.5)] flex items-center justify-center gap-3 tracking-wide"
                    >
                      {enquirySending ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Processing…
                        </>
                      ) : (
                        <>
                          <FaPaperPlane />
                          Submit Inquiry
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Booking Card Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 sticky top-28 shadow-[0_20px_40px_rgb(0,0,0,0.04)]">
              <div className="mb-8">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">
                  Investment
                </p>
                <div className="flex flex-col mb-6 pb-6 border-b border-slate-100">
                  <span className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-1">
                    <span className="text-lg font-bold text-slate-400 mr-1 opacity-70">Le</span>
                    {apartment.price_per_month.toLocaleString()}
                  </span>
                  <span className="text-slate-500 font-light tracking-wide">Per Month</span>
                </div>
                
                <div className="space-y-4 text-slate-600">
                  <div className="flex justify-between items-center p-3 sm:bg-slate-50 rounded-xl">
                    <span className="font-medium text-slate-500">Security Deposit</span>
                    <span className="font-bold text-slate-900">
                      Le {apartment.deposit_amount.toLocaleString()}
                    </span>
                  </div>
                  {apartment.lease_duration_months && (
                    <div className="flex justify-between items-center p-3 sm:bg-slate-50 rounded-xl">
                      <span className="font-medium text-slate-500">Minimum Lease</span>
                      <span className="font-bold text-slate-900 bg-white sm:border border-slate-200 px-3 py-1 rounded-lg shadow-sm">
                        {apartment.lease_duration_months} Months
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleBooking}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold tracking-wide rounded-xl transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_10px_40px_rgba(16,185,129,0.5)] mb-4"
              >
                Reserve Now
              </button>
              
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <FaShieldAlt className="text-slate-300" />
                <p className="text-center text-xs font-medium">
                  Zero commitment. Pay at signing.
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
