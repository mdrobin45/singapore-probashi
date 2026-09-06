import { prisma } from "@/lib/prisma";
import {
  type SiteContactSettings,
  DEFAULT_CONTACT_SETTINGS,
  formatWhatsAppLink,
} from "./site-contact-types";

export { type SiteContactSettings, DEFAULT_CONTACT_SETTINGS, formatWhatsAppLink };

export async function getSiteContactSettings(): Promise<SiteContactSettings> {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "site_whatsapp_number",
            "site_whatsapp_message",
            "site_support_email",
            "site_support_phone",
            "site_facebook_url",
            "site_office_address",
            "site_office_hours",
          ],
        },
      },
    });

    const map = new Map(rows.map((r) => [r.key, r.value]));

    return {
      whatsappNumber: map.get("site_whatsapp_number") || DEFAULT_CONTACT_SETTINGS.whatsappNumber,
      whatsappMessage: map.get("site_whatsapp_message") || DEFAULT_CONTACT_SETTINGS.whatsappMessage,
      supportEmail: map.get("site_support_email") || DEFAULT_CONTACT_SETTINGS.supportEmail,
      supportPhone: map.get("site_support_phone") || DEFAULT_CONTACT_SETTINGS.supportPhone,
      facebookUrl: map.get("site_facebook_url") || DEFAULT_CONTACT_SETTINGS.facebookUrl,
      officeAddress: map.get("site_office_address") || DEFAULT_CONTACT_SETTINGS.officeAddress,
      officeHours: map.get("site_office_hours") || DEFAULT_CONTACT_SETTINGS.officeHours,
    };
  } catch {
    return DEFAULT_CONTACT_SETTINGS;
  }
}
