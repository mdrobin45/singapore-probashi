"use client";

import { useActionState } from "react";
import { saveWhatsAppApiSettingsAction } from "@/app/actions/admin-settings";

type WhatsAppSettings = {
  enabled: boolean;
  apiUrl: string;
  apiToken: string;
};

export function WhatsAppApiSettingsForm({ settings }: { settings: WhatsAppSettings }) {
  const [state, action, pending] = useActionState(saveWhatsAppApiSettingsAction, null);

  return (
    <form action={action} className="space-y-4">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-800 leading-relaxed">
        <strong>⚡ 100% Automated Silent WhatsApp Sending:</strong> When enabled, automated alerts and reminders are sent directly to the user&apos;s phone from the server without opening WhatsApp or requiring extra clicks! Compatible with any WhatsApp Gateway / REST API (e.g. <em>UltraMsg, Green-API, WPPConnect, or Meta WhatsApp Cloud API</em>).
      </div>

      <div className="flex items-center gap-3">
        <input
          id="whatsapp_enabled"
          name="enabled"
          type="checkbox"
          defaultChecked={settings.enabled}
          className="rounded border-border text-brand focus:ring-brand/30 h-4 w-4"
        />
        <label htmlFor="whatsapp_enabled" className="text-xs text-foreground font-semibold">
          Enable Automated Background WhatsApp API
        </label>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            WhatsApp API Endpoint URL
          </label>
          <input
            name="apiUrl"
            type="url"
            defaultValue={settings.apiUrl}
            placeholder="https://api.ultramsg.com/INSTANCE_ID/messages/chat or https://api.green-api.com/waInstance..."
            className="w-full text-sm px-3.5 py-2 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-mono text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            WhatsApp API Token / Auth Key
          </label>
          <input
            name="apiToken"
            type="password"
            defaultValue={settings.apiToken}
            placeholder="Enter your API Token / Instance Key"
            className="w-full text-sm px-3.5 py-2 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </div>
      </div>

      {state?.error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {state.error}
        </p>
      )}

      {state?.success && (
        <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
          WhatsApp Automated API settings updated successfully!
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-brand text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
      >
        {pending ? "Saving…" : "Save WhatsApp API Settings"}
      </button>
    </form>
  );
}
