"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaTrash, FaUpload } from "react-icons/fa";

const CITIES = ["Freetown", "Bo", "Kenema", "Makeni", "Koidu", "Lunsar"];

interface ExistingImage {
  id: string;
  url: string;
  display_order: number;
}

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Existing images from DB
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

  // New image files to upload
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

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
    status: "PENDING",
  });

  const setField = (key: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!params.id) return;
    fetchApartment();
  }, [params.id]);

  const fetchApartment = async () => {
    try {
      const { data, error } = await supabase
        .from("apartments")
        .select("*, apartment_images(id, url, display_order)")
        .eq("id", params.id)
        .single();

      if (error) throw error;

      // Verify ownership
      if (data.landlord_id !== user?.id) {
        toast.error("You don't have permission to edit this property");
        router.push("/dashboard/landlord");
        return;
      }

      setForm({
        title: data.title,
        description: data.description,
        address: data.address,
        city: data.city,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        square_feet: data.square_feet?.toString() ?? "",
        price_per_month: data.price_per_month.toString(),
        deposit_amount: data.deposit_amount.toString(),
        available_from: data.available_from,
        lease_duration_months: data.lease_duration_months?.toString() ?? "",
        status: data.status,
      });

      setExistingImages(
        [...(data.apartment_images ?? [])].sort(
          (a, b) => a.display_order - b.display_order,
        ),
      );
    } catch (err: any) {
      toast.error("Failed to load property");
      router.push("/dashboard/landlord");
    } finally {
      setPageLoading(false);
    }
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const total =
      existingImages.length -
      deletedImageIds.length +
      newImageFiles.length +
      files.length;
    if (total > 8) {
      toast.error("Maximum 8 images allowed");
      return;
    }
    setNewImageFiles((prev) => [...prev, ...files]);
    setNewImagePreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeNewImage = (idx: number) => {
    URL.revokeObjectURL(newImagePreviews[idx]);
    setNewImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = (id: string) => {
    setDeletedImageIds((prev) => [...prev, id]);
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
  };

  const uploadNewImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of newImageFiles) {
      const ext = file.name.split(".").pop();
      const path = `${params.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("apartment-images")
        .upload(path, file, { upsert: false });
      if (error) {
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
    if (!user) return;
    setSubmitting(true);

    try {
      // Update apartment row
      const { error: updateError } = await supabase
        .from("apartments")
        .update({
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
        })
        .eq("id", params.id)
        .eq("landlord_id", user.id);

      if (updateError) throw updateError;

      // Delete removed images
      if (deletedImageIds.length > 0) {
        await supabase
          .from("apartment_images")
          .delete()
          .in("id", deletedImageIds);
      }

      // Upload and insert new images
      if (newImageFiles.length > 0) {
        const newUrls = await uploadNewImages();
        const startOrder = existingImages.length;
        if (newUrls.length > 0) {
          await supabase.from("apartment_images").insert(
            newUrls.map((url, idx) => ({
              apartment_id: params.id,
              url,
              display_order: startOrder + idx,
            })),
          );
        }
      }

      toast.success("Property updated!");
      router.push("/dashboard/landlord");
    } catch (err: any) {
      toast.error(err.message || "Failed to update property");
    } finally {
      setSubmitting(false);
    }
  };

  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";
  const inputCls =
    "w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:border-green-500 focus:bg-white transition-colors placeholder:text-gray-400";

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center gap-4">
          <Link
            href="/dashboard/landlord"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
          >
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-xl font-black text-gray-900">Edit Property</h1>
            <p className="text-sm text-gray-500">
              Changes save immediately after submission
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto px-4 py-8 space-y-8"
      >
        {/* Images */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Photos{" "}
            <span className="text-sm font-normal text-gray-400">(up to 8)</span>
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
            {/* Existing images */}
            {existingImages.map((img, idx) => (
              <div
                key={img.id}
                className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
              >
                <Image
                  src={img.url}
                  alt={`Photo ${idx + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(img.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
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

            {/* New image previews */}
            {newImagePreviews.map((src, idx) => (
              <div
                key={`new-${idx}`}
                className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 ring-2 ring-green-400 ring-offset-1"
              >
                <Image
                  src={src}
                  alt={`New photo ${idx + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeNewImage(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <FaTrash className="text-[9px]" />
                </button>
                <span className="absolute bottom-1.5 left-1.5 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded-md font-semibold">
                  New
                </span>
              </div>
            ))}

            {existingImages.length + newImageFiles.length < 8 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-green-400 hover:bg-green-50 transition-colors text-gray-400 hover:text-green-600"
              >
                <FaUpload className="text-lg" />
                <span className="text-xs font-medium">Add</span>
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
            Green-ringed images are new and will be uploaded on save.
          </p>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="text-lg font-bold text-gray-900">Property Details</h2>

          <div>
            <label className={labelCls}>
              Title <span className="text-red-500">*</span>
            </label>
            <input
              required
              className={inputCls}
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
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
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
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
                onChange={(e) => setField("city", e.target.value)}
              >
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>
                Address <span className="text-red-500">*</span>
              </label>
              <input
                required
                className={inputCls}
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Rooms */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="text-lg font-bold text-gray-900">Rooms &amp; Size</h2>

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
                onChange={(e) => setField("bedrooms", e.target.value)}
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
                onChange={(e) => setField("bathrooms", e.target.value)}
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
                onChange={(e) => setField("square_feet", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="text-lg font-bold text-gray-900">
            Pricing &amp; Availability
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
                value={form.price_per_month}
                onChange={(e) => setField("price_per_month", e.target.value)}
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
                value={form.deposit_amount}
                onChange={(e) => setField("deposit_amount", e.target.value)}
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
                onChange={(e) => setField("available_from", e.target.value)}
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
                onChange={(e) =>
                  setField("lease_duration_months", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pb-8">
          <Link
            href="/dashboard/landlord"
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors shadow-md flex items-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
