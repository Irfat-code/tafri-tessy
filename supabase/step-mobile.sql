-- Mobile app step: run once in the Supabase SQL Editor.
-- Signed-in customers' carts live here so the website and the app share one cart.
create table if not exists cart_items (
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  -- 0 means "removed". Rows are never deleted, so every change is an UPDATE
  -- that Realtime can deliver to just this customer.
  quantity integer not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table cart_items enable row level security;

-- Customers can read their own cart (needed for Realtime). All writes go
-- through the website's API with the service-role key.
create policy "own cart" on cart_items for select using (user_id = auth.uid());

-- Turn on Realtime for this table.
alter publication supabase_realtime add table cart_items;
