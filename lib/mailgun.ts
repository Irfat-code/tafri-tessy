export async function sendMail(to: string, subject: string, html: string) {
  const body = new URLSearchParams({
    from: `TafriTessy <postmaster@${process.env.MAILGUN_DOMAIN}>`,
    to,
    subject,
    html,
  });

  const res = await fetch(
    `${process.env.MAILGUN_API_BASE}/v3/${process.env.MAILGUN_DOMAIN}/messages`,
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
}
