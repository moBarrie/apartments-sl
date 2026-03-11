#!/usr/bin/env node
/**
 * Demo data seeder for Apartments.SL
 *
 * Creates two demo accounts and six demo apartments in Freetown.
 *
 * Prerequisites — add to .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...   ← Project Settings → API → service_role key
 *
 * Run:
 *   npm run seed
 */

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error(
    "\n❌  Missing env vars.\n" +
      "    NEXT_PUBLIC_SUPABASE_URL  and  SUPABASE_SERVICE_ROLE_KEY\n" +
      "    must both be set in .env.local\n",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── helpers ────────────────────────────────────────────────────────────────

async function createDemoUser(email, password, fullName, role, phone) {
  // Check if user already exists in auth
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users?.find((u) => u.email === email);
  if (found) {
    console.log(`  ⚠️  ${email} already exists — skipping auth creation`);
    // Make sure public.users row exists
    const { data: profile } = await supabase
      .from("users")
      .select("id")
      .eq("id", found.id)
      .single();
    if (!profile) {
      await supabase
        .from("users")
        .insert({ id: found.id, email, full_name: fullName, role, phone });
    }
    return found.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) {
    console.error(`  ❌  Failed to create ${email}:`, error.message);
    process.exit(1);
  }

  const userId = data.user.id;
  const { error: profileErr } = await supabase
    .from("users")
    .insert({ id: userId, email, full_name: fullName, role, phone });
  if (profileErr) {
    console.error(
      `  ❌  Failed to insert profile for ${email}:`,
      profileErr.message,
    );
    process.exit(1);
  }

  return userId;
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱  Seeding demo data for Apartments.SL\n");

  // 1. Demo users ─────────────────────────────────────────────────────────────
  console.log("👤  Creating demo users…");

  const landlordId = await createDemoUser(
    "landlord@demo.sl",
    "demo123456",
    "Mohamed Kamara",
    "LANDLORD",
    "+232 76 123 456",
  );
  console.log(`  ✅  Landlord  → landlord@demo.sl  (id: ${landlordId})`);

  // Ensure landlord_profiles row
  await supabase
    .from("landlord_profiles")
    .upsert({ user_id: landlordId }, { onConflict: "user_id" });

  const renterId = await createDemoUser(
    "renter@demo.sl",
    "demo123456",
    "Aminata Koroma",
    "RENTER",
    "+232 77 654 321",
  );
  console.log(`  ✅  Renter    → renter@demo.sl    (id: ${renterId})\n`);

  // 2. Demo apartments ─────────────────────────────────────────────────────────
  console.log("🏠  Creating demo apartments…");

  const today = new Date().toISOString().split("T")[0];

  const apartments = [
    {
      landlord_id: landlordId,
      title: "Modern 2-Bed Apartment in Aberdeen",
      description:
        "Bright, fully furnished apartment in the heart of Aberdeen with stunning sea views. Features high-speed Wi-Fi, 24/7 security, covered parking and a private balcony. Walking distance to shops, banks and the beach.",
      address: "12 Aberdeen Road",
      city: "Freetown",
      bedrooms: 2,
      bathrooms: 2.0,
      square_feet: 1050,
      price_per_month: 1200,
      deposit_amount: 2400,
      available_from: today,
      status: "APPROVED",
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0d47?w=800&q=80",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
      ],
    },
    {
      landlord_id: landlordId,
      title: "Cosy Studio in Lumley",
      description:
        "Compact, well-maintained studio ideal for a single professional or student. Includes air conditioning, hot water and a secure gated compound. Close to Lumley Beach and the main Congo Cross junction.",
      address: "45 Lumley Beach Road",
      city: "Freetown",
      bedrooms: 1,
      bathrooms: 1.0,
      square_feet: 480,
      price_per_month: 450,
      deposit_amount: 900,
      available_from: today,
      status: "APPROVED",
      featured: false,
      images: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
      ],
    },
    {
      landlord_id: landlordId,
      title: "Spacious 3-Bed Family Home in Wilberforce",
      description:
        "Generous family home set in a quiet, leafy street in Wilberforce. Three large bedrooms, open-plan kitchen/lounge, two bathrooms, back garden and two parking bays. Generator backup included.",
      address: "7 Wilberforce Street",
      city: "Freetown",
      bedrooms: 3,
      bathrooms: 2.0,
      square_feet: 1800,
      price_per_month: 2200,
      deposit_amount: 4400,
      available_from: today,
      status: "APPROVED",
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
        "https://images.unsplash.com/photo-1571508601-7232b9a1af91?w=800&q=80",
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
        "https://images.unsplash.com/photo-1549517045-bc93de630f8c?w=800&q=80",
      ],
    },
    {
      landlord_id: landlordId,
      title: "Executive 1-Bed Flat in Hill Station",
      description:
        "Tastefully finished executive flat with panoramic views over Freetown and the peninsula. Central A/C, open kitchen, marble bathroom, 24/7 security and concierge. Perfect for expats and diplomats.",
      address: "Hill Station Drive, Plot 3",
      city: "Freetown",
      bedrooms: 1,
      bathrooms: 1.0,
      square_feet: 750,
      price_per_month: 900,
      deposit_amount: 1800,
      available_from: today,
      status: "APPROVED",
      featured: false,
      images: [
        "https://images.unsplash.com/photo-1631679706909-1cd7f2e60c95?w=800&q=80",
        "https://images.unsplash.com/photo-1617805575005-541c52a04cb0?w=800&q=80",
      ],
    },
    {
      landlord_id: landlordId,
      title: "Affordable 2-Bed Flat in Murray Town",
      description:
        "Clean and practical 2-bedroom flat ideal for young couples or small families. Tiled floors throughout, indoor kitchen, shared compound with garden. Short walk to the Murray Town bus terminal.",
      address: "22B Murray Town Road",
      city: "Freetown",
      bedrooms: 2,
      bathrooms: 1.0,
      square_feet: 820,
      price_per_month: 650,
      deposit_amount: 1300,
      available_from: today,
      status: "APPROVED",
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1612810806563-4cb8e1c5b9e9?w=800&q=80",
        "https://images.unsplash.com/photo-1648583323937-66e3d7d1dcf0?w=800&q=80",
      ],
    },
    {
      landlord_id: landlordId,
      title: "Modern 2-Bed Apartment in Bo City Centre",
      description:
        "Well-appointed apartment in the centre of Bo — Sierra Leone's second-largest city. Two bedrooms, modern kitchen, reliable borehole water and a backup generator. Great location for business travellers.",
      address: "Dambala Road, Bo",
      city: "Bo",
      bedrooms: 2,
      bathrooms: 1.0,
      square_feet: 900,
      price_per_month: 700,
      deposit_amount: 1400,
      available_from: today,
      status: "APPROVED",
      featured: false,
      images: [
        "https://images.unsplash.com/photo-1565183928294-7063f23ce0f8?w=800&q=80",
        "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800&q=80",
      ],
    },
  ];

  for (const apt of apartments) {
    const { images, ...aptData } = apt;

    const { data: inserted, error: aptErr } = await supabase
      .from("apartments")
      .insert(aptData)
      .select("id")
      .single();

    if (aptErr) {
      console.error(
        `  ❌  Failed to insert "${aptData.title}":`,
        aptErr.message,
      );
      continue;
    }

    // Insert images
    const imageRows = images.map((url, i) => ({
      apartment_id: inserted.id,
      url,
      display_order: i,
    }));
    const { error: imgErr } = await supabase
      .from("apartment_images")
      .insert(imageRows);
    if (imgErr) {
      console.error(
        `  ⚠️  Images failed for "${aptData.title}":`,
        imgErr.message,
      );
    }

    console.log(`  ✅  "${aptData.title}" (${aptData.city})`);
  }

  // 3. Summary ─────────────────────────────────────────────────────────────────
  console.log(`
╔═══════════════════════════════════════════════════╗
║           🎉  Demo data seeded!                   ║
╠═══════════════════════════════════════════════════╣
║  Landlord  landlord@demo.sl  / demo123456         ║
║  Renter    renter@demo.sl    / demo123456         ║
╚═══════════════════════════════════════════════════╝
`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
