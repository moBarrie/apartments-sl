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
