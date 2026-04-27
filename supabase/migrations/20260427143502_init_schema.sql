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
