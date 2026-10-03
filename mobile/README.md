# TafriTessy mobile app

The TafriTessy shop as a native Android (and iOS) app, built with Expo and React Native. It uses the same Supabase database and the same website API as https://tafritessy.vercel.app, with a phone layout: bottom tabs, a sticky buy bar, bottom-sheet pickers and pull to refresh.

## Screens

| Tab / screen | What it does |
|---|---|
| Home | Hero, Shop by Occasion, Featured Wreaths, custom design and WhatsApp buttons |
| Shop | Category chips and a two-column wreath grid |
| Product | Photo, price, stock, quantity, Add to Cart / Buy Now, heart to save |
| Custom | The custom wreath request form, with a date picker and an inspiration photo from the gallery |
| Cart | Quantities, remove, totals with delivery |
| Checkout → Payment | Delivery details, then Paystack's payment page inside the app |
| Order result | Confirms the payment with the website and clears the cart |
| Account | Google sign-in, My Orders, My Bookings, Saved Items, About, Privacy, Terms, log out |

The admin dashboard stays on the website. Admins get an "Open admin dashboard" button in Account.

## How it talks to the website

The app only needs the site URL (`extra.siteUrl` in `app.json`, or `EXPO_PUBLIC_SITE_URL`). On start it loads the public Supabase URL, anon key, WhatsApp number and delivery fee from `GET /api/mobile/config`.

- Products, orders, bookings and saved items are read from Supabase with the customer's session, so Row Level Security applies exactly as on the website.
- The cart works like the website's: guests keep it on the phone; signed-in customers share one cart with the website through `/api/cart`, and Supabase Realtime updates it instantly on both. A guest cart moves into the shared cart on sign-in.
- Checkout and bookings post to the website's `/api/checkout` and `/api/bookings`, with `Authorization: Bearer <access token>` so orders are linked to the signed-in customer.
- After Paystack, the app calls `/api/orders/verify?reference=...`, which runs the same check as the website's thank-you page.

## One-time Supabase setting for Google sign-in

In Supabase → Authentication → URL Configuration → Redirect URLs, add:

```
tafritessy://auth/callback
```

Without it, Google sign-in in the app returns to the website instead of the app. Shopping and checkout work without signing in.

## Run it

```bash
cd mobile
npm install
npx expo run:android     # needs Android Studio / an Android SDK
```

## Build the APK

GitHub Actions builds it on every push that changes `mobile/` (workflow: `.github/workflows/android-apk.yml`). Download `TafriTessy.apk` from the **Android app (latest build)** release, or from the run's Artifacts.

To build locally with an Android SDK installed: `npm run build:apk`. The APK lands in `android/app/build/outputs/apk/release/`.

The APK is signed with the default debug key, which is fine for installing directly on phones. Before publishing to Google Play, create an upload key and build an `.aab` instead.
