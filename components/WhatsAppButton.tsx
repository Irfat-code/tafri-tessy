// Opens a WhatsApp chat with the owner and a ready-typed message.
// The number comes from NEXT_PUBLIC_WHATSAPP_NUMBER (e.g. 2348012345678);
// if it isn't set, the button simply doesn't show.
const DEFAULT_MESSAGE = "Hi TafriTessy! I'd like to book a consultation for a custom wreath.";

export function whatsappLink(message = DEFAULT_MESSAGE) {
  const raw = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  if (!raw) return null;
  // Accept local Nigerian numbers like 0801... as well as 234801...
  const number = raw.startsWith("0") ? "234" + raw.slice(1) : raw;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export default function WhatsAppButton({
  label = "Chat on WhatsApp",
  message,
  className = "",
}: {
  label?: string;
  message?: string;
  className?: string;
}) {
  const href = whatsappLink(message);
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-white hover:bg-[#1ebe5b] ${className}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91A9.85 9.85 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28Z" />
      </svg>
      {label}
    </a>
  );
}
