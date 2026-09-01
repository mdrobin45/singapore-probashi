import { prisma } from "@/lib/prisma";

export async function getWhatsAppConfig() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: { in: ["whatsapp_api_url", "whatsapp_api_token", "whatsapp_api_enabled"] },
      },
    });
    const map = new Map(settings.map((s) => [s.key, s.value]));
    const enabled = map.get("whatsapp_api_enabled") === "true" || process.env.WHATSAPP_API_ENABLED === "true";
    const apiUrl = map.get("whatsapp_api_url") || process.env.WHATSAPP_API_URL || "";
    const apiToken = map.get("whatsapp_api_token") || process.env.WHATSAPP_API_TOKEN || "";

    return {
      enabled: Boolean(enabled && apiUrl && apiToken),
      apiUrl,
      apiToken,
    };
  } catch {
    return {
      enabled: Boolean(process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_TOKEN),
      apiUrl: process.env.WHATSAPP_API_URL || "",
      apiToken: process.env.WHATSAPP_API_TOKEN || "",
    };
  }
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
  const config = await getWhatsAppConfig();

  if (!config.enabled || !config.apiUrl || !config.apiToken) {
    return { success: false, error: "WhatsApp API credentials not configured in Admin Settings or .env" };
  }

  const digits = to.replace(/[^\d]/g, "");

  try {
    let headers: Record<string, string> = { "Content-Type": "application/json" };
    let body: Record<string, unknown> = {};

    const url = config.apiUrl.trim();

    // 1. Green API support (Instant free & easiest)
    if (url.includes("green-api.com")) {
      body = {
        chatId: `${digits}@c.us`,
        message: text,
      };
    }
    // 2. UltraMsg support
    else if (url.includes("ultramsg.com")) {
      body = {
        token: config.apiToken,
        to: digits,
        body: text,
      };
    }
    // 3. Standard / Custom / Meta Cloud API
    else {
      headers["Authorization"] = `Bearer ${config.apiToken}`;
      body = {
        to: digits,
        text,
        message: text,
        body: text,
        chatId: `${digits}@c.us`,
        mediaUrl: mediaUrl || undefined,
      };
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
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
