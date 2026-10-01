"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendMail } from "@/lib/mailgun";
import { customerDeliveredEmail } from "@/lib/emails";
import { CATEGORIES } from "@/lib/categories";

const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

function str(form: FormData, key: string) {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

// Paid -> delivered (emails the customer), or delivered -> paid to undo a mistake.
export async function toggleDelivered(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  const { data: order } = await supabaseAdmin.from("orders").select("*").eq("id", id).single();
  if (!order || !["paid", "delivered"].includes(order.status)) return;

  const next = order.status === "paid" ? "delivered" : "paid";
  await supabaseAdmin.from("orders").update({ status: next }).eq("id", id);

  if (next === "delivered") {
    const mail = customerDeliveredEmail(order);
    await sendMail(order.email, mail.subject, mail.html, process.env.OWNER_EMAIL);
  }
  revalidatePath("/admin", "layout");
}

export async function updateBookingStatus(form: FormData) {
  await requireAdmin();
  const status = str(form, "status");
  if (!BOOKING_STATUSES.includes(status)) return;
  await supabaseAdmin.from("bookings").update({ status }).eq("id", str(form, "id"));
  revalidatePath("/admin", "layout");
}

// Uploads a wreath photo to the public "wreaths" bucket and returns its URL.
async function uploadPhoto(form: FormData): Promise<string | null> {
  const photo = form.get("photo");
  if (!(photo instanceof File) || photo.size === 0) return null;
  if (!photo.type.startsWith("image/")) throw new Error("Photo must be an image.");
  const ext = photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabaseAdmin.storage.from("wreaths").upload(path, photo, { contentType: photo.type });
  if (error) throw new Error("Photo upload failed: " + error.message);
  return supabaseAdmin.storage.from("wreaths").getPublicUrl(path).data.publicUrl;
}

function productFields(form: FormData) {
  const name = str(form, "name");
  const price = Number(str(form, "price"));
  const stock = Number(str(form, "stock"));
  const category = str(form, "category");
  if (!name) throw new Error("Name is required.");
  if (!Number.isFinite(price) || price <= 0) throw new Error("Price must be more than 0.");
  if (!Number.isInteger(stock) || stock < 0) throw new Error("Stock must be 0 or more.");
  if (!CATEGORIES.some((c) => c.key === category)) throw new Error("Choose a category.");
  return {
    name,
    description: str(form, "description") || null,
    price_kobo: Math.round(price * 100),
    stock,
    category,
    is_available: form.get("is_available") === "on",
  };
}

function refreshShop() {
  revalidatePath("/", "layout");
}

export async function createProduct(form: FormData) {
  await requireAdmin();
  const fields = productFields(form);
  const image_url = await uploadPhoto(form);
  const { error } = await supabaseAdmin.from("products").insert({ ...fields, image_url });
  if (error) throw new Error(error.message);
  refreshShop();
}

export async function updateProduct(form: FormData) {
  await requireAdmin();
  const fields = productFields(form);
  const image_url = await uploadPhoto(form);
  const { error } = await supabaseAdmin
    .from("products")
    .update(image_url ? { ...fields, image_url } : fields)
    .eq("id", str(form, "id"));
  if (error) throw new Error(error.message);
  refreshShop();
}
