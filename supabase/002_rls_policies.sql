-- Enable Row Level Security
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
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public users info is viewable" ON users
  FOR SELECT USING (true);

-- Landlord profiles
CREATE POLICY "Anyone can view verified landlords" ON landlord_profiles
  FOR SELECT USING (is_verified = true);

CREATE POLICY "Landlords manage own profile" ON landlord_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Apartments
CREATE POLICY "Anyone can view approved apartments" ON apartments
  FOR SELECT USING (status = 'APPROVED');

CREATE POLICY "Landlords manage own apartments" ON apartments
  FOR ALL USING (auth.uid() = landlord_id);

-- Apartment images
CREATE POLICY "Images viewable with apartment" ON apartment_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM apartments WHERE apartments.id = apartment_images.apartment_id)
  );

CREATE POLICY "Landlords manage apartment images" ON apartment_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM apartments WHERE apartments.id = apartment_images.apartment_id AND apartments.landlord_id = auth.uid())
  );

-- Amenities (public read)
CREATE POLICY "Anyone can view amenities" ON amenities
  FOR SELECT USING (true);

-- Apartment amenities
CREATE POLICY "Anyone can view apartment amenities" ON apartment_amenities
  FOR SELECT USING (true);

CREATE POLICY "Landlords manage apartment amenities" ON apartment_amenities
  FOR ALL USING (
    EXISTS (SELECT 1 FROM apartments WHERE apartments.id = apartment_amenities.apartment_id AND apartments.landlord_id = auth.uid())
  );

-- Bookings
CREATE POLICY "Users view own bookings" ON bookings
  FOR SELECT USING (
    auth.uid() = renter_id OR 
    EXISTS (SELECT 1 FROM apartments WHERE apartments.id = bookings.apartment_id AND apartments.landlord_id = auth.uid())
  );

CREATE POLICY "Renters create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Users update own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = renter_id);

-- Payments
CREATE POLICY "Users view own payments" ON payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = payments.booking_id AND 
      (bookings.renter_id = auth.uid() OR 
       EXISTS (SELECT 1 FROM apartments WHERE apartments.id = bookings.apartment_id AND apartments.landlord_id = auth.uid())))
  );

-- Reviews
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Renters create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Favorites
CREATE POLICY "Users manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- Messages
CREATE POLICY "Users view own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receivers update messages" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Blocked dates
CREATE POLICY "Anyone can view blocked dates" ON blocked_dates
  FOR SELECT USING (true);

CREATE POLICY "Landlords manage blocked dates" ON blocked_dates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM apartments WHERE apartments.id = blocked_dates.apartment_id AND apartments.landlord_id = auth.uid())
  );

-- Notifications
CREATE POLICY "Users manage own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);
