// WhatsApp integration supporting both 1-click wa.me links and automated WhatsApp Cloud API / Webhook sending

export function waLink(phone: string, text: string) {
  const digits = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export async function sendWhatsAppMessage({
  to,
  text,
  mediaUrl,
}: {
  to: string;
  text: string;
  mediaUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiToken = process.env.WHATSAPP_API_TOKEN;

  if (!apiUrl || !apiToken) {
    // API not configured, rely on direct wa.me interactive links
    return { success: false, error: "WhatsApp API credentials not configured in environment." };
  }

  const digits = to.replace(/[^\d]/g, "");
  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        to: digits,
        text,
        mediaUrl: mediaUrl || undefined,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `WhatsApp API HTTP ${res.status}: ${errText}` };
    }

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
