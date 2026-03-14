"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaPlus, FaTrash, FaUpload, FaHome, FaBuilding } from "react-icons/fa";

const CITIES = ["Freetown", "Bo", "Kenema", "Makeni", "Koidu", "Lunsar"];

export default function NewPropertyPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    address: "",
    city: "Freetown",
    bedrooms: 1,
    bathrooms: 1,
    square_feet: "",
    price_per_month: "",
    deposit_amount: "",
    available_from: "",
    lease_duration_months: "",
    property_type: "APARTMENT",
    total_units: 1,
  });

  const set = (key: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (imageFiles.length + files.length > 8) {
      toast.error("Maximum 8 images allowed");
      return;
    }
    setImageFiles((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(imagePreviews[idx]);
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const uploadImages = async (apartmentId: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of imageFiles) {
      const ext = file.name.split(".").pop();
      const path = `${apartmentId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("apartment-images")
        .upload(path, file, { upsert: false });

      if (error) {
        console.error("Image upload error:", error);
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("apartment-images").getPublicUrl(path);

      urls.push(publicUrl);
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in");
      router.push("/login");
      return;
    }

    if (!form.price_per_month || !form.deposit_amount || !form.available_from) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      // Insert apartment (status = PENDING for admin review)
      const { data: apt, error: aptError } = await supabase
        .from("apartments")
        .insert({
          landlord_id: user.id,
          title: form.title.trim(),
          description: form.description.trim(),
          address: form.address.trim(),
          city: form.city,
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          square_feet: form.square_feet ? Number(form.square_feet) : null,
          price_per_month: Number(form.price_per_month),
          deposit_amount: Number(form.deposit_amount),
          available_from: form.available_from,
          lease_duration_months: form.lease_duration_months
            ? Number(form.lease_duration_months)
            : null,
          property_type: form.property_type,
          total_units: Number(form.total_units),
          is_entire_block: form.property_type === "APARTMENT_BLOCK",
          status: "PENDING",
        })
        .select("id")
        .single();

      if (aptError) throw aptError;

      // Upload and attach images
      if (imageFiles.length > 0) {
        const imageUrls = await uploadImages(apt.id);
        if (imageUrls.length > 0) {
          const imageRows = imageUrls.map((url, idx) => ({
            apartment_id: apt.id,
            url,
            display_order: idx,
          }));
          await supabase.from("apartment_images").insert(imageRows);
        }
      }

      toast.success("Property submitted for review!");
      router.push("/dashboard/landlord");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create property");
    } finally {
      setSubmitting(false);
    }
  };

  const labelCls = "block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1";
  const inputCls =
    "w-full px-5 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400 shadow-sm";

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Header */}
      <div className="bg-white border-b border-slate-100 mb-8">
        <div className="max-w-4xl mx-auto px-4 py-8 flex items-center gap-6">
          <Link
            href="/dashboard/landlord"
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all shadow-sm group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              List a New Property
            </h1>
            <p className="text-slate-500 font-light mt-1">
              Add your residence to the elite collection — review in 24 hrs
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto px-4 space-y-8 animate-fade-in-up"
      >
        {/* Images */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Property Gallery
            </h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              {imageFiles.length} / 8 Images
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
            {imagePreviews.map((src, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-xl overflow-hidden bg-slate-100"
              >
                <Image
                  src={src}
                  alt={`Preview ${idx + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                >
                  <FaTrash className="text-[9px]" />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md font-semibold">
                    Cover
                  </span>
                )}
              </div>
            ))}

            {imageFiles.length < 8 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 hover:border-emerald-400 hover:bg-emerald-50 transition-all text-slate-400 hover:text-emerald-600 group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <FaUpload className="text-lg" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Add Photos</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleImagePick}
          />
          <p className="text-xs text-gray-400">
            JPG, PNG or WebP. First image will be used as cover.
          </p>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 space-y-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">Essential Details</h2>

          <div>
            <label className={labelCls}>
              Title <span className="text-red-500">*</span>
            </label>
            <input
              required
              className={inputCls}
              placeholder="e.g. Spacious 3-bedroom flat in Lumley"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              className={inputCls}
              placeholder="Describe the property — features, surroundings, nearby amenities…"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                City <span className="text-red-500">*</span>
              </label>
              <select
                required
                className={inputCls}
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              >
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>
                Property Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                className={inputCls}
                value={form.property_type}
                onChange={(e) => set("property_type", e.target.value)}
              >
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="STUDIO">Studio</option>
                <option value="APARTMENT_BLOCK">Apartment Block (Entire Building)</option>
                <option value="VILLA">Villa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Address <span className="text-red-500">*</span>
              </label>
              <input
                required
                className={inputCls}
                placeholder="Street / area"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </div>

            {form.property_type === "APARTMENT_BLOCK" && (
              <div>
                <label className={labelCls}>
                  Total Units in Block <span className="text-emerald-500">*</span>
                </label>
                <div className="relative">
                  <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min={1}
                    required
                    className={`${inputCls} pl-11`}
                    value={form.total_units}
                    onChange={(e) => set("total_units", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rooms & Size */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 space-y-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">Volume &amp; Scale</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>
                Bedrooms <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                max={20}
                required
                className={inputCls}
                value={form.bedrooms}
                onChange={(e) => set("bedrooms", e.target.value)}
              />
            </div>

            <div>
              <label className={labelCls}>
                Bathrooms <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={20}
                step={0.5}
                required
                className={inputCls}
                value={form.bathrooms}
                onChange={(e) => set("bathrooms", e.target.value)}
              />
            </div>

            <div>
              <label className={labelCls}>Size (ft²)</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                placeholder="Optional"
                value={form.square_feet}
                onChange={(e) => set("square_feet", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 space-y-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">
            Pricing &amp; Terms
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Monthly Rent (Le) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                required
                className={inputCls}
                placeholder="e.g. 2500000"
                value={form.price_per_month}
                onChange={(e) => set("price_per_month", e.target.value)}
              />
            </div>

            <div>
              <label className={labelCls}>
                Security Deposit (Le) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                required
                className={inputCls}
                placeholder="e.g. 5000000"
                value={form.deposit_amount}
                onChange={(e) => set("deposit_amount", e.target.value)}
              />
            </div>

            <div>
              <label className={labelCls}>
                Available From <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                className={inputCls}
                value={form.available_from}
                onChange={(e) => set("available_from", e.target.value)}
              />
            </div>

            <div>
              <label className={labelCls}>Min. Lease (months)</label>
              <input
                type="number"
                min={1}
                className={inputCls}
                placeholder="Optional"
                value={form.lease_duration_months}
                onChange={(e) => set("lease_duration_months", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between gap-6 pb-12">
          <Link
            href="/dashboard/landlord"
            className="px-8 py-4 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-3 active:scale-95"
          >
            {submitting ? (
              <>
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <FaPlus className="text-sm" />
                Publish Property
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
