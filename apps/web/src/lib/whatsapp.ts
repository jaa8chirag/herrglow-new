/** wa.me link, or null when no number is configured (UI then hides WhatsApp entirely). */
export function whatsappLink(number: string | null | undefined, text?: string): string | null {
  const digits = (number ?? "").replace(/\D/g, "");
  if (digits.length < 10) return null;
  const full = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${full}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
export const telLink = (n: string | null | undefined) => (n && n.replace(/\D/g, "").length >= 10 ? `tel:+${n.replace(/\D/g, "").replace(/^(\d{10})$/, "91$1")}` : null);
