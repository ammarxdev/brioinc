CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text,
  email text,
  status text DEFAULT 'pending',
  is_verified boolean DEFAULT false,
  role text DEFAULT 'user',
  balance numeric DEFAULT 0
);

CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  amount numeric,
  status text DEFAULT 'unpaid',
  client_email text,
  description text,
  nowpayment_link text,
  nowpayment_id text,
  invoice_number text
);
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  amount numeric,
  description text,
  status text DEFAULT 'completed',
  method text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE cards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  card_number text,
  card_holder text,
  expiry_date text,
  status text DEFAULT 'active',
  type text DEFAULT 'virtual',
  spending_limit numeric DEFAULT 25000,
  spent_amount numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, status, role, is_verified)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', 'New User'), 
    new.email, 
    'pending', 
    'user', 
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
