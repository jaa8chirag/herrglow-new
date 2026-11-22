/** wa.me link, or null when no number is configured. */
export function whatsappLink(number: string | null | undefined, text?: string): string {
  const digits = (number ?? "").replace(/\D/g, "");
  if (digits.length < 10) return "";
  const full = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${full}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function telLink(n: string | null | undefined): string | null {
  const digits = (n ?? "").replace(/\D/g, "");
  return digits.length >= 10 ? `tel:+${digits.length === 10 ? `91${digits}` : digits}` : null;
}
