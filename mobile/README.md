# TafriTessy mobile app

Expo (React Native) app for the TafriTessy shop. It uses the **same API endpoints** as the website
(`/api/products`, `/api/cart`, `/api/checkout`, `/api/orders`) and the same Google sign-in (Supabase).

The cart is shared: add a wreath on the website and it appears in the app's cart instantly, and the
other way round. Both listen to the `cart_items` table with Supabase Realtime.

## Run it on your phone

1. Install **Expo Go** from the Play Store or App Store.
2. In this folder:
   ```bash
   npm install
   cp .env.example .env     # then fill in the two Supabase values
   npx expo start
   ```
3. Scan the QR code with Expo Go (Android) or the Camera app (iPhone).
   Your phone and computer must be on the same Wi-Fi. If they can't be, use `npx expo start --tunnel`.

## Screens

- **Shop:** wreaths with category filters
- **Product:** photo, price, stock, quantity, Add to Cart and Buy Now
- **Cart:** the shared cart, updated live, with quantity controls and totals
- **Checkout:** delivery details, then Paystack in the browser
- **Account:** Google sign-in, My Orders, Book a Custom Wreath and log out
