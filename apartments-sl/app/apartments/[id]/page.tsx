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
  FaStar,
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
  const { user } = useAuthStore();
  const supabase = createClient();

  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchApartment();
    if (user) checkFavorite();
  }, [params.id]);

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
        .eq("status", "APPROVED")
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

    if (user.role === "LANDLORD") {
      toast.error("Landlords cannot book apartments");
      return;
    }

    router.push(`/apartments/${params.id}/book`);
  };

  const handleMessage = () => {
    if (!user) {
      toast.error("Please sign in to message");
      router.push("/login");
      return;
    }

    router.push(
      `/messages?to=${apartment?.landlord_id}&apartment=${params.id}`,
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse">
          <div className="h-80 bg-gray-200 rounded-2xl mb-3" />
          <div className="grid grid-cols-4 gap-3 mb-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl" />
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-32 bg-gray-200 rounded-xl" />
            </div>
            <div className="h-64 bg-gray-200 rounded-2xl" />
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Gallery */}
        <div className="mb-8">
          <div className="relative h-80 md:h-[420px] bg-gray-200 rounded-2xl overflow-hidden mb-3">
            <Image
              src={images[selectedImage].url}
              alt={apartment.title}
              fill
              className="object-cover"
            />
            <button
              onClick={toggleFavorite}
              className="absolute top-4 right-4 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              {isFavorite ? (
                <FaHeart className="text-red-500 text-lg" />
              ) : (
                <FaRegHeart className="text-gray-600 text-lg" />
              )}
            </button>
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative h-20 rounded-xl overflow-hidden ${
                    selectedImage === idx
                      ? "ring-2 ring-primary-500 ring-offset-2"
                      : "opacity-70 hover:opacity-100"
                  } transition-all`}
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h1 className="text-3xl font-black text-gray-900 mb-3">
                {apartment.title}
              </h1>
              <p className="text-gray-500 flex items-center gap-2 mb-6">
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
                    className="bg-gray-50 rounded-xl p-4 text-center"
                  >
                    <Icon className="text-primary-500 text-xl mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                      {label}
                    </p>
                    <p className="font-bold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                About this property
              </h2>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                {apartment.description}
              </p>
            </div>

            {/* Landlord */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">
                Listed by
              </h2>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {apartment.users.avatar_url ? (
                    <Image
                      src={apartment.users.avatar_url}
                      alt={apartment.users.full_name}
                      width={56}
                      height={56}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-gray-400 text-xl" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    {apartment.users.full_name}
                  </p>
                  <p className="text-gray-500 text-sm">Property Owner</p>
                </div>
              </div>
              <button
                onClick={handleMessage}
                className="w-full py-3 px-4 border border-primary-200 text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-xl font-semibold transition-colors"
              >
                Send Message
              </button>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24 shadow-lg">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1 font-medium">
                  Monthly Rent
                </p>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-4xl font-black text-primary-600">
                    Le {apartment.price_per_month.toLocaleString()}
                  </span>
                  <span className="text-gray-500">/mo</span>
                </div>
                <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-3">
                  <div className="flex justify-between">
                    <span>Security deposit</span>
                    <span className="font-semibold text-gray-900">
                      Le {apartment.deposit_amount.toLocaleString()}
                    </span>
                  </div>
                  {apartment.lease_duration_months && (
                    <div className="flex justify-between">
                      <span>Min. lease</span>
                      <span className="font-semibold text-gray-900">
                        {apartment.lease_duration_months} months
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleBooking}
                className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-md mb-3"
              >
                Book Now
              </button>
              <p className="text-center text-gray-400 text-xs">
                You won't be charged until confirmed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
