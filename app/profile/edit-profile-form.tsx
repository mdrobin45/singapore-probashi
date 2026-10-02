"use client";

import { useActionState, useState } from "react";
import { updateProfileDetailsAction } from "@/app/actions/profile";

export function EditProfileForm({
  initialFullName,
  initialPhone,
  initialNidNumber,
  email,
}: {
  initialFullName: string;
  initialPhone: string | null;
  initialNidNumber: string | null;
  email: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, action, pending] = useActionState(updateProfileDetailsAction, null);

  return (
    <div className="border-t border-border pt-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Contact & Personal Details</h3>
          <p className="text-xs text-muted-foreground">
            {initialPhone ? "Manage your contact number and information" : "⚠️ Please add your WhatsApp phone number to receive alerts"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:border-brand hover:text-brand bg-white text-foreground transition-all cursor-pointer shadow-2xs"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-xl border border-border/80">
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-0.5">Full Name</p>
            <p className="text-sm font-semibold text-foreground">{initialFullName || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-0.5">Email Address</p>
            <p className="text-sm font-medium text-foreground">{email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-0.5">Phone / WhatsApp Number</p>
            {initialPhone ? (
              <p className="text-sm font-mono font-bold text-emerald-700">{initialPhone}</p>
            ) : (
              <p className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                No phone added yet — Click Edit to add
              </p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-0.5">NID / Passport Number</p>
            <p className="text-sm font-mono text-foreground">{initialNidNumber || "—"}</p>
          </div>
        </div>
      ) : (
        <form
          action={async (formData) => {
            await action(formData);
            setIsEditing(false);
          }}
          className="space-y-4 bg-slate-50 p-5 rounded-xl border border-brand/20 shadow-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                name="fullName"
                type="text"
                required
                defaultValue={initialFullName}
                placeholder="e.g. Mohammad Rakib"
                className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Email (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-slate-100 text-muted-foreground cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                WhatsApp / Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                name="phone"
                type="tel"
                required
                defaultValue={initialPhone || ""}
                placeholder="e.g. +65 8123 4567 or +880 1712 345678"
                className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-mono font-medium"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Include country code (e.g. +65 for Singapore, +880 for Bangladesh) for WhatsApp alerts.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                National ID / Passport Number
              </label>
              <input
                name="nidNumber"
                type="text"
                defaultValue={initialNidNumber || ""}
                placeholder="e.g. 1990123456789 or A01234567"
                className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-mono"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Used for official Share Certificates.
              </p>
            </div>
          </div>

          {state?.error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={pending}
              className="bg-brand text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
            >
              {pending ? "Saving..." : "Save Profile Details"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs font-semibold px-3 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
