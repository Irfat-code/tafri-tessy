// replyTo: where a customer's reply goes (your sister's inbox), since the sender is postmaster@...
export async function sendMail(to: string, subject: string, html: string, replyTo?: string) {
  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
    console.warn(`Mailgun not configured yet, skipped email: "${subject}" to ${to}`);
    return;
  }

  const body = new URLSearchParams({
    from: `TafriTessy <postmaster@${process.env.MAILGUN_DOMAIN}>`,
    to,
    subject,
    html,
  });
  if (replyTo) body.set("h:Reply-To", replyTo);

  try {
    const res = await fetch(
      `${process.env.MAILGUN_API_BASE ?? "https://api.mailgun.net"}/v3/${process.env.MAILGUN_DOMAIN}/messages`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " + Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString("base64"),
        },
        body,
      }
    );
    if (!res.ok) console.error("Mailgun error", res.status, await res.text());
  } catch (err) {
    // An email failure must never break an order or booking.
    console.error("Mailgun request failed", err);
  }
}
