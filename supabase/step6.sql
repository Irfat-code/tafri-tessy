-- Step 6: run this once in the Supabase SQL Editor (after schema.sql).
-- Marks an order paid and takes the wreaths out of stock in one go.
-- Returns false if the order was already paid, so a repeat call does nothing.
create or replace function mark_order_paid(p_order_id uuid) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  update orders set status = 'paid' where id = p_order_id and status = 'pending';
  if not found then
    return false;
  end if;

  update products p
     set stock = greatest(p.stock - oi.quantity, 0)
    from order_items oi
   where oi.order_id = p_order_id and oi.product_id = p.id;

  return true;
end $$;

-- Only the server (service-role key) may call it.
revoke execute on function mark_order_paid(uuid) from public, anon, authenticated;
