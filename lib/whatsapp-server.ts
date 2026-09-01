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
    const res = await fetch(config.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiToken}`,
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
