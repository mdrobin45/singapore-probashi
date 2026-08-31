"use client";

import { useActionState } from "react";
import { saveAdSenseSettingsAction } from "@/app/actions/admin-settings";

export function AdSenseSettingsForm({
  settings,
}: {
  settings: { enabled: boolean; clientId: string };
}) {
  const [state, action, pending] = useActionState(saveAdSenseSettingsAction, null);

  return (
    <form action={action} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-semibold text-foreground">Enable Google AdSense</label>
          <p className="text-xs text-muted-foreground">Show advertisements across public community pages</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={settings.enabled}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
        </label>
      </div>

      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">
          AdSense Publisher Client ID
        </label>
        <input
          name="clientId"
          type="text"
          defaultValue={settings.clientId}
          placeholder="ca-pub-XXXXXXXXXXXXXXXX"
          className="w-full text-sm px-3.5 py-2 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-mono"
        />
        <p className="text-[11px] text-muted-foreground mt-1">
          Found in your Google AdSense account under Settings → Account Information.
        </p>
      </div>

      {state?.error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {state.error}
        </p>
      )}

      {state?.success && (
        <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
          AdSense settings saved successfully!
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-brand text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-60 cursor-pointer"
      >
        {pending ? "Saving…" : "Save AdSense Settings"}
      </button>
    </form>
  );
}
