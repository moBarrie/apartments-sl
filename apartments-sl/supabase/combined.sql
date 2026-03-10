-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('LANDLORD', 'RENTER');
CREATE TYPE apartment_status AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'RENTER',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Landlord profiles
CREATE TABLE landlord_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT,
  tax_id TEXT,
  verification_status TEXT DEFAULT 'PENDING',
  verification_documents JSONB,
  stripe_account_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Apartments
CREATE TABLE apartments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  landlord_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'Sierra Leone',
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  bedrooms INTEGER NOT NULL,
  bathrooms DECIMAL(3, 1) NOT NULL,
  square_feet INTEGER,
  price_per_month DECIMAL(10, 2) NOT NULL,
  deposit_amount DECIMAL(10, 2) NOT NULL,
  available_from DATE NOT NULL,
  lease_duration_months INTEGER,
  status apartment_status NOT NULL DEFAULT 'DRAFT',
  featured BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Apartment images
CREATE TABLE apartment_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Amenities
CREATE TABLE amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Apartment amenities junction table
CREATE TABLE apartment_amenities (
  apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (apartment_id, amenity_id)
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  renter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  deposit_amount DECIMAL(10, 2) NOT NULL,
  status booking_status NOT NULL DEFAULT 'PENDING',
  special_requests TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_type TEXT NOT NULL, -- 'DEPOSIT', 'RENT', 'REFUND'
  status payment_status NOT NULL DEFAULT 'PENDING',
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  renter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  landlord_response TEXT,
  landlord_response_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(booking_id)
);

-- Favorites
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, apartment_id)
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  apartment_id UUID REFERENCES apartments(id) ON DELETE SET NULL,
  subject TEXT,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Blocked dates
CREATE TABLE blocked_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'BOOKING', 'PAYMENT', 'MESSAGE', 'REVIEW', 'SYSTEM'
  related_id UUID, -- Can reference bookings, messages, etc.
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_apartments_landlord ON apartments(landlord_id);
CREATE INDEX idx_apartments_city ON apartments(city);
CREATE INDEX idx_apartments_status ON apartments(status);
CREATE INDEX idx_apartments_available_from ON apartments(available_from);
CREATE INDEX idx_apartment_images_apartment ON apartment_images(apartment_id);
CREATE INDEX idx_bookings_apartment ON bookings(apartment_id);
CREATE INDEX idx_bookings_renter ON bookings(renter_id);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_reviews_apartment ON reviews(apartment_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_landlord_profiles_updated_at BEFORE UPDATE ON landlord_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apartments_updated_at BEFORE UPDATE ON apartments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE landlord_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartment_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartment_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Landlord profiles policies
CREATE POLICY "Landlords can view own profile" ON landlord_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Landlords can update own profile" ON landlord_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Landlords can insert own profile" ON landlord_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Apartments policies
CREATE POLICY "Anyone can view approved apartments" ON apartments
  FOR SELECT USING (status = 'APPROVED' OR landlord_id = auth.uid());

CREATE POLICY "Landlords can insert own apartments" ON apartments
  FOR INSERT WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update own apartments" ON apartments
  FOR UPDATE USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can delete own apartments" ON apartments
  FOR DELETE USING (auth.uid() = landlord_id);

-- Apartment images policies
CREATE POLICY "Anyone can view images of approved apartments" ON apartment_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM apartments
      WHERE apartments.id = apartment_images.apartment_id
      AND (apartments.status = 'APPROVED' OR apartments.landlord_id = auth.uid())
    )
  );

CREATE POLICY "Landlords can manage own apartment images" ON apartment_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM apartments
      WHERE apartments.id = apartment_images.apartment_id
      AND apartments.landlord_id = auth.uid()
    )
  );

-- Amenities policies (public read, admin write)
CREATE POLICY "Anyone can view amenities" ON amenities
  FOR SELECT TO public USING (true);

-- Apartment amenities policies
CREATE POLICY "Anyone can view apartment amenities" ON apartment_amenities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM apartments
      WHERE apartments.id = apartment_amenities.apartment_id
      AND (apartments.status = 'APPROVED' OR apartments.landlord_id = auth.uid())
    )
  );

CREATE POLICY "Landlords can manage own apartment amenities" ON apartment_amenities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM apartments
      WHERE apartments.id = apartment_amenities.apartment_id
      AND apartments.landlord_id = auth.uid()
    )
  );

-- Bookings policies
CREATE POLICY "Renters can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = renter_id);

CREATE POLICY "Landlords can view bookings for their apartments" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM apartments
      WHERE apartments.id = bookings.apartment_id
      AND apartments.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Renters can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Renters can update own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = renter_id);

CREATE POLICY "Landlords can update bookings for their apartments" ON bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM apartments
      WHERE apartments.id = bookings.apartment_id
      AND apartments.landlord_id = auth.uid()
    )
  );

-- Payments policies
CREATE POLICY "Users can view payments for their bookings" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = payments.booking_id
      AND (
        bookings.renter_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM apartments
          WHERE apartments.id = bookings.apartment_id
          AND apartments.landlord_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "System can create payments" ON payments
  FOR INSERT WITH CHECK (true);

-- Reviews policies
CREATE POLICY "Anyone can view reviews for approved apartments" ON reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM apartments
      WHERE apartments.id = reviews.apartment_id
      AND apartments.status = 'APPROVED'
    )
  );

CREATE POLICY "Renters can create reviews for their bookings" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Renters can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = renter_id);

CREATE POLICY "Landlords can respond to reviews" ON reviews
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM apartments
      WHERE apartments.id = reviews.apartment_id
      AND apartments.landlord_id = auth.uid()
    )
  );

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view sent messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id);

CREATE POLICY "Users can view received messages" ON messages
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can mark messages as read" ON messages
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Blocked dates policies
CREATE POLICY "Anyone can view blocked dates" ON blocked_dates
  FOR SELECT USING (true);

CREATE POLICY "Landlords can manage blocked dates for own apartments" ON blocked_dates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM apartments
      WHERE apartments.id = blocked_dates.apartment_id
      AND apartments.landlord_id = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);
-- Insert default amenities
INSERT INTO amenities (name, icon) VALUES
  ('WiFi', 'wifi'),
  ('Air Conditioning', 'snowflake'),
  ('Heating', 'fire'),
  ('Kitchen', 'utensils'),
  ('Washer', 'shirt'),
  ('Dryer', 'wind'),
  ('Parking', 'car'),
  ('Pool', 'swimming-pool'),
  ('Gym', 'dumbbell'),
  ('Balcony', 'door-open'),
  ('Garden', 'tree'),
  ('Pet Friendly', 'paw'),
  ('Security', 'shield-alt'),
  ('Furnished', 'couch')
ON CONFLICT (name) DO NOTHING;
