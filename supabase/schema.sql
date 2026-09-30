-- TafriTessy schema. Run in Supabase SQL Editor.

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz default now()
);

-- auto-create a profile on first (Google) sign-in
create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, email, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email,
          new.raw_user_meta_data->>'avatar_url');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_kobo integer not null check (price_kobo > 0), -- store money in kobo
  category text not null,  -- wedding, birthday, home, funeral, seasonal
  image_url text,
  stock integer not null default 1 check (stock >= 0),
  is_available boolean not null default true,
  created_at timestamptz default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_no serial,  -- shown as #TT1000+order_no
  user_id uuid references profiles(id),
  email text not null,
  phone text not null,
  full_name text not null,
  address text not null,
  city text not null,
  state text not null,
  subtotal_kobo integer not null,
  delivery_kobo integer not null,
  total_kobo integer not null,
  status text not null default 'pending' check (status in ('pending','paid','delivered','cancelled')),
  paystack_reference text unique,
  created_at timestamptz default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity integer not null check (quantity > 0),
  unit_price_kobo integer not null
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  full_name text not null,
  email text not null,
  phone text not null,
  occasion text not null,
  preferred_date date,
  wreath_type text,
  colours text,
  budget text,
  description text,
  inspiration_url text,
  status text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled')),
  created_at timestamptz default now()
);

create table favorites (
  user_id uuid references profiles(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  primary key (user_id, product_id)
);

-- Row Level Security
alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table bookings enable row level security;
alter table favorites enable row level security;

create function is_admin() returns boolean
language sql security definer stable as
$$ select coalesce((select is_admin from profiles where id = auth.uid()), false) $$;

create policy "own profile" on profiles for select using (id = auth.uid() or is_admin());
create policy "public read products" on products for select using (true);
create policy "admin manage products" on products for all using (is_admin()) with check (is_admin());
create policy "own orders" on orders for select using (user_id = auth.uid() or is_admin());
create policy "own order items" on order_items for select using (
  exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
create policy "own bookings" on bookings for select using (user_id = auth.uid() or is_admin());
create policy "own favorites" on favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());
-- Inserts into orders/order_items/bookings happen server-side with the service-role key.

-- Placeholder seed data
insert into products (name, description, price_kobo, category, image_url, stock) values
 ('Elegant Rose Wreath','Handmade wreath with roses, eucalyptus and greenery.',4500000,'wedding','/wreaths/rose.jpg',1),
 ('White Garden Wreath','Soft white blooms with lush greenery.',3500000,'home','/wreaths/garden.jpg',2),
 ('Sunflower Wreath','Bright sunflowers for a cheerful welcome.',4000000,'birthday','/wreaths/sunflower.jpg',2),
 ('Lavender Dreams','Lavender and purple florals.',3800000,'home','/wreaths/lavender.jpg',1),
 ('Rustic Fall Wreath','Warm autumn tones and berries.',4200000,'seasonal','/wreaths/fall.jpg',1),
 ('Christmas Wreath','Festive reds and evergreens.',5000000,'seasonal','/wreaths/christmas.jpg',3);

-- Storage: create a public bucket named "wreaths" and a bucket "inspiration" in the dashboard.
