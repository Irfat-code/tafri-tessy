# TafriTessy · Wreaths • Designs • More

An online shop for handmade floral wreaths. Customers can buy ready-made wreaths, pay online and book custom designs. The owner manages everything from an admin dashboard.

**Live site:** https://tafritessy.vercel.app

## Features

- **Shop:** home page, shop with category filters, product pages with stock levels
- **Cart and checkout:** the cart is saved in the browser, and checkout collects delivery details across Nigerian states
- **Payments:** Paystack in test mode. The server recalculates every price from the database, and orders are confirmed by both the Paystack webhook and a verify call on the thank-you page
- **Custom bookings:** a request form with an optional inspiration photo upload
- **Google sign-in:** Supabase Auth with Google OAuth credentials from Google Cloud Console
- **Customer account:** My Orders, My Bookings and Saved Items (wishlist)
- **Emails:** Mailgun order confirmations, booking confirmations, owner notifications and "delivered" emails
- **Admin dashboard (`/admin`):** sales overview, mark orders delivered, manage booking requests, add or edit wreaths with photo upload

## Tech stack

| Need | Tool |
|---|---|
| Frontend and API routes | Next.js 16 (App Router), TypeScript, Tailwind CSS 4 |
| Database, auth, file storage | Supabase (Postgres with Row Level Security, Google Auth, Storage) |
| Payments | Paystack |
| Email | Mailgun |
| Hosting | Vercel |

## Run it locally

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3001
```

### Environment variables

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API Keys |
| `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack → Settings → API Keys & Webhooks (test keys) |
| `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_API_BASE` | Mailgun → Domains / API Security |
| `OWNER_EMAIL` | Receives new order and booking notifications |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3001` locally, the Vercel URL in production |

### Database setup

In the Supabase SQL Editor, run these in order:

1. `supabase/schema.sql`: tables, Row Level Security policies and seed wreaths
2. `supabase/step6.sql`: the `mark_order_paid` function, which marks an order paid and reduces stock in one step
3. `supabase/step-images.sql`: points the seed wreaths at the photos in `public/wreaths/`

Then create two Storage buckets: `wreaths` (public) and `inspiration` (private). To make an account an admin, run:

```sql
update profiles set is_admin = true where email = 'you@example.com';
```

## Testing payments

Use Paystack's test card: `4084 0840 8408 4081`, CVV `408`, any future expiry, PIN `0000`, OTP `123456`.

The webhook URL is `https://tafritessy.vercel.app/api/paystack/webhook`.

## Project structure

```
app/            pages and API routes (checkout, Paystack webhook, bookings, admin)
components/     header, footer, product card, booking form, admin form parts
lib/            Supabase clients, Paystack, Mailgun, email templates, order fulfilment
supabase/       SQL to set up the database
public/         logo and wreath photos
```
