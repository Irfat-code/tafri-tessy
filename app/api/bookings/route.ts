import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";
import { sendMail } from "@/lib/mailgun";
import { customerBookingEmail, ownerBookingEmail } from "@/lib/emails";
import { BUDGETS, MAX_PHOTO_BYTES, OCCASIONS, WREATH_TYPES } from "@/lib/booking";

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function text(form: FormData, key: string, max = 300) {
  const v = form.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return fail("Invalid request.");

  const booking = {
    full_name: text(form, "full_name"),
    email: text(form, "email"),
    phone: text(form, "phone", 30),
    occasion: text(form, "occasion"),
    preferred_date: text(form, "preferred_date", 10) || null,
    wreath_type: text(form, "wreath_type") || null,
    colours: text(form, "colours") || null,
    budget: text(form, "budget") || null,
    description: text(form, "description", 2000) || null,
  };

  if (!booking.full_name || !booking.email || !booking.phone || !booking.occasion) {
    return fail("Please fill in your name, email, phone and occasion.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email)) return fail("Please enter a valid email address.");
  if (!/^[+\d][\d\s-]{6,19}$/.test(booking.phone)) return fail("Please enter a valid phone number.");
  if (!OCCASIONS.includes(booking.occasion)) return fail("Please choose an occasion.");
  if (booking.wreath_type && !WREATH_TYPES.includes(booking.wreath_type)) return fail("Please choose a wreath type.");
  if (booking.budget && !BUDGETS.includes(booking.budget)) return fail("Please choose a budget.");
  if (booking.preferred_date && Number.isNaN(Date.parse(booking.preferred_date))) return fail("Please choose a valid date.");

  // Optional inspiration photo goes to the private "inspiration" bucket.
  let inspirationPath: string | null = null;
  const photo = form.get("inspiration");
  if (photo instanceof File && photo.size > 0) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type)) return fail("Photo must be a JPG, PNG or WEBP image.");
    if (photo.size > MAX_PHOTO_BYTES) return fail("Photo must be smaller than 4MB.");
    const ext = photo.type.split("/")[1].replace("jpeg", "jpg");
    inspirationPath = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabaseAdmin.storage
      .from("inspiration")
      .upload(inspirationPath, photo, { contentType: photo.type });
    if (error) {
      console.error("Inspiration upload failed", error);
      return fail("Could not upload your photo. Please try again.", 500);
    }
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabaseAdmin
    .from("bookings")
    .insert({ ...booking, user_id: user?.id ?? null, inspiration_url: inspirationPath });
  if (error) {
    console.error("Booking insert failed", error);
    return fail("Could not save your request. Please try again.", 500);
  }

  // Emails: confirmation to the customer, notification to the owner.
  const toCustomer = customerBookingEmail(booking);
  await sendMail(booking.email, toCustomer.subject, toCustomer.html);

  if (process.env.OWNER_EMAIL) {
    let link: string | null = null;
    if (inspirationPath) {
      const { data } = await supabaseAdmin.storage.from("inspiration").createSignedUrl(inspirationPath, 60 * 60 * 24 * 7);
      link = data?.signedUrl ?? null;
    }
    const toOwner = ownerBookingEmail(booking, link);
    await sendMail(process.env.OWNER_EMAIL, toOwner.subject, toOwner.html);
  }

  return NextResponse.json({ ok: true });
}
