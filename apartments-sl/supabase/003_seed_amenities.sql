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
