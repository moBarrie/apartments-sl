#!/usr/bin/env node
/**
 * Apartments.SL — One-shot setup script
 *
 * What this does:
 *  1. Runs all SQL migrations (schema, RLS, amenities, auth trigger)
 *  2. Turns off email confirmation so you can sign in immediately
 *  3. Creates two demo accounts (landlord + renter)
 *  4. Seeds 6 demo apartments in Sierra Leone
 *
 * Required env vars in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL        ← already set
 *   SUPABASE_SERVICE_ROLE_KEY       ← Supabase Dashboard → Settings → API
 *
 * Run:
 *   npm run setup
 */

require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");
const https = require("https");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(`
❌  Missing required environment variables.

Please add to .env.local:
  SUPABASE_SERVICE_ROLE_KEY=<your key>

Where to find it:
  https://supabase.com/dashboard/project/asauyvnlonlzgrdkxynl/settings/api
  → "Project API keys" section → "service_role" key (click reveal)
`);
  process.exit(1);
}

// ── helpers ──────────────────────────────────────────────────────────────────

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Extract project ref from URL: https://<ref>.supabase.co
const PROJECT_REF = SUPABASE_URL.replace("https://", "").replace(
  ".supabase.co",
  "",
);

/** Call the Supabase Management API (requires service key) */
async function mgmtFetch(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: "api.supabase.com",
      path,
      method,
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (c) => (raw += c));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, body: raw });
        }
      });
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

/** Run a SQL string via the Supabase pg API */
async function runSQL(label, sql) {
  const res = await mgmtFetch(
    "POST",
    `/v1/projects/${PROJECT_REF}/database/query`,
    { query: sql },
  );
  if (res.status !== 200 && res.status !== 201) {
    const msg =
      typeof res.body === "object"
        ? res.body?.message || JSON.stringify(res.body)
        : res.body;
    // Ignore "already exists" errors — migrations are idempotent
    if (
      msg?.includes("already exists") ||
      msg?.includes("duplicate key") ||
      msg?.includes("IF NOT EXISTS")
    ) {
      console.log(`  ⚠️  ${label} — already exists, skipping`);
      return;
    }
    throw new Error(`${label} failed (${res.status}): ${msg}`);
  }
  console.log(`  ✅  ${label}`);
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🚀  Apartments.SL Setup\n");
  console.log(`📡  Project: ${PROJECT_REF}\n`);

  // ── 1. Run SQL migrations ───────────────────────────────────────────────
  console.log("📄  Running SQL migrations…");
  const sqlFiles = [
    ["Schema", "supabase/001_schema.sql"],
    ["RLS Policies", "supabase/002_rls_policies.sql"],
    ["Seed Amenities", "supabase/003_seed_amenities.sql"],
    ["Auth Trigger", "supabase/004_auth_trigger.sql"],
  ];

  for (const [label, file] of sqlFiles) {
    const sql = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
    await runSQL(label, sql);
  }

  // ── 2. Disable email confirmation ──────────────────────────────────────
  console.log("\n⚙️   Configuring auth settings…");
  const authRes = await mgmtFetch(
    "PATCH",
    `/v1/projects/${PROJECT_REF}/config/auth`,
    {
      mailer_autoconfirm: true, // disable email confirmation
      external_email_enabled: true,
      disable_signup: false,
    },
  );
  if (authRes.status === 200) {
    console.log(
      "  ✅  Email confirmation disabled — users can sign in immediately",
    );
  } else {
    console.log(
      `  ⚠️  Could not update auth config via API (${authRes.status}).`,
    );
    console.log(
      "      Manually disable: Supabase → Authentication → Providers → Email → uncheck 'Confirm email'",
    );
  }

  // ── 3. Demo accounts ───────────────────────────────────────────────────
  console.log("\n👤  Creating demo accounts…");

  async function upsertDemoUser(email, password, fullName, role, phone) {
    // Check if already exists
    const { data: existing } = await supabase.auth.admin.listUsers({
      perPage: 1000,
    });
    const found = existing?.users?.find((u) => u.email === email);
    let userId;

    if (found) {
      console.log(`  ⚠️  ${email} already exists — using existing account`);
      userId = found.id;
      // Update password to known value
      await supabase.auth.admin.updateUserById(userId, { password });
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, role },
      });
      if (error) {
        console.error(`  ❌  Failed to create ${email}:`, error.message);
        return null;
      }
      userId = data.user.id;
    }

    // Ensure public.users row
    await supabase
      .from("users")
      .upsert(
        { id: userId, email, full_name: fullName, role, phone },
        { onConflict: "id" },
      );

    return userId;
  }

  const landlordId = await upsertDemoUser(
    "landlord@demo.sl",
    "demo123456",
    "Mohamed Kamara",
    "LANDLORD",
    "+232 76 123 456",
  );
  if (landlordId) {
    await supabase
      .from("landlord_profiles")
      .upsert({ user_id: landlordId }, { onConflict: "user_id" });
    console.log(`  ✅  Landlord  →  landlord@demo.sl  /  demo123456`);
  }

  const renterId = await upsertDemoUser(
    "renter@demo.sl",
    "demo123456",
    "Aminata Koroma",
    "RENTER",
    "+232 77 654 321",
  );
  if (renterId)
    console.log(`  ✅  Renter    →  renter@demo.sl    /  demo123456`);

  // ── 4. Demo apartments ─────────────────────────────────────────────────
  if (!landlordId) {
    console.log("\n⚠️  Skipping apartments (no landlord id)");
  } else {
    console.log("\n🏠  Seeding demo apartments…");
    const today = new Date().toISOString().split("T")[0];

    const apartments = [
      {
        title: "Modern 2-Bed Apartment in Aberdeen",
        description:
          "Bright, fully furnished apartment in the heart of Aberdeen with stunning sea views. Features high-speed Wi-Fi, 24/7 security, covered parking and a private balcony.",
        address: "12 Aberdeen Road",
        city: "Freetown",
        bedrooms: 2,
        bathrooms: 2.0,
        square_feet: 1050,
        price_per_month: 1200,
        deposit_amount: 2400,
        featured: true,
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0d47?w=800&q=80",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
        ],
      },
      {
        title: "Cosy Studio in Lumley",
        description:
          "Compact, well-maintained studio ideal for a single professional or student. Includes air conditioning, hot water and a secure gated compound.",
        address: "45 Lumley Beach Road",
        city: "Freetown",
        bedrooms: 1,
        bathrooms: 1.0,
        square_feet: 480,
        price_per_month: 450,
        deposit_amount: 900,
        featured: false,
        images: [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
        ],
      },
      {
        title: "Spacious 3-Bed Family Home in Wilberforce",
        description:
          "Generous family home in a quiet Wilberforce street. Three large bedrooms, open-plan kitchen/lounge, back garden and two parking bays. Generator backup included.",
        address: "7 Wilberforce Street",
        city: "Freetown",
        bedrooms: 3,
        bathrooms: 2.0,
        square_feet: 1800,
        price_per_month: 2200,
        deposit_amount: 4400,
        featured: true,
        images: [
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
          "https://images.unsplash.com/photo-1571508601-7232b9a1af91?w=800&q=80",
        ],
      },
      {
        title: "Executive 1-Bed Flat in Hill Station",
        description:
          "Tastefully finished flat with panoramic views over Freetown. Central A/C, open kitchen, marble bathroom, 24/7 security. Perfect for expats.",
        address: "Hill Station Drive, Plot 3",
        city: "Freetown",
        bedrooms: 1,
        bathrooms: 1.0,
        square_feet: 750,
        price_per_month: 900,
        deposit_amount: 1800,
        featured: false,
        images: [
          "https://images.unsplash.com/photo-1631679706909-1cd7f2e60c95?w=800&q=80",
        ],
      },
      {
        title: "Affordable 2-Bed Flat in Murray Town",
        description:
          "Clean and practical flat ideal for young couples or small families. Tiled floors, indoor kitchen, shared compound with garden.",
        address: "22B Murray Town Road",
        city: "Freetown",
        bedrooms: 2,
        bathrooms: 1.0,
        square_feet: 820,
        price_per_month: 650,
        deposit_amount: 1300,
        featured: true,
        images: [
          "https://images.unsplash.com/photo-1612810806563-4cb8e1c5b9e9?w=800&q=80",
        ],
      },
      {
        title: "Modern 2-Bed Apartment in Bo City Centre",
        description:
          "Well-appointed apartment in the centre of Bo. Two bedrooms, modern kitchen, reliable borehole water and backup generator.",
        address: "Dambala Road, Bo",
        city: "Bo",
        bedrooms: 2,
        bathrooms: 1.0,
        square_feet: 900,
        price_per_month: 700,
        deposit_amount: 1400,
        featured: false,
        images: [
          "https://images.unsplash.com/photo-1565183928294-7063f23ce0f8?w=800&q=80",
        ],
      },
    ];

    // Delete existing demo apartments (owned by this landlord) to avoid duplicates
    await supabase.from("apartments").delete().eq("landlord_id", landlordId);

    for (const apt of apartments) {
      const { images, ...aptData } = apt;
      const { data: inserted, error } = await supabase
        .from("apartments")
        .insert({
          ...aptData,
          landlord_id: landlordId,
          available_from: today,
          status: "APPROVED",
          country: "Sierra Leone",
        })
        .select("id")
        .single();

      if (error) {
        console.error(`  ❌  "${aptData.title}": ${error.message}`);
        continue;
      }

      await supabase.from("apartment_images").insert(
        images.map((url, i) => ({
          apartment_id: inserted.id,
          url,
          display_order: i,
        })),
      );
      console.log(`  ✅  "${aptData.title}" (${aptData.city})`);
    }
  }

  // ── Done ───────────────────────────────────────────────────────────────
  console.log(`
╔═══════════════════════════════════════════════════════╗
║          ✅  Setup complete!                           ║
╠═══════════════════════════════════════════════════════╣
║  Landlord  landlord@demo.sl   password: demo123456    ║
║  Renter    renter@demo.sl     password: demo123456    ║
╠═══════════════════════════════════════════════════════╣
║  6 demo apartments seeded and APPROVED                ║
║  Email confirmation is OFF — sign in immediately      ║
╚═══════════════════════════════════════════════════════╝

  👉  npm run dev  →  http://localhost:3000
`);
}

main().catch((err) => {
  console.error("\n❌  Setup failed:", err.message);
  process.exit(1);
});
