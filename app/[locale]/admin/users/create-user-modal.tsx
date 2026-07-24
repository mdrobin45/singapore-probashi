"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createUserAction } from "@/app/actions/admin-users";

const ROLE_RANK: Record<string, number> = { USER: 0, MODERATOR: 1, ADMIN: 2, SUPER_ADMIN: 3 };
const ALL_ROLES = ["USER", "MODERATOR", "ADMIN", "SUPER_ADMIN"];

function randomPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  let out = "";
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function CreateUserModal({ actorRole }: { actorRole: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [state, action, pending] = useActionState(createUserAction, null);

  const selectableRoles = ALL_ROLES.filter((r) => ROLE_RANK[actorRole] > ROLE_RANK[r]);

  useEffect(() => {
    if (state?.success) {
      router.refresh();
      const timer = setTimeout(() => {
        setOpen(false);
        setPassword("");
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [state, router]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors"
      >
        + Add User
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl border border-border shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-foreground">Add User</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form action={action} className="p-6 space-y-4">
              <p className="text-xs text-muted-foreground -mt-1">
                This account is created and marked verified immediately — no OTP email is sent. Share the password with the user directly.
              </p>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Full Name</label>
                <input
                  name="fullName"
                  type="text"
                  required
                  placeholder="e.g. Mohammad Rahman"
                  className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@email.com"
                  className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Phone</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="+65 or +880"
                  className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Role</label>
                <select
                  name="role"
                  defaultValue={selectableRoles[0] ?? "USER"}
                  className="w-full px-3 py-2.5 rounded-lg border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                >
                  {selectableRoles.map((r) => (
                    <option key={r} value={r}>{r.replace("_", " ")}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Password</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full px-3 py-2.5 pr-9 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        {showPassword
                          ? <><path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                          : <><path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>}
                      </svg>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setPassword(randomPassword()); setShowPassword(true); }}
                    className="text-xs font-semibold px-3 py-2.5 rounded-lg border border-border hover:border-brand hover:text-brand transition-colors shrink-0"
                  >
                    Generate
                  </button>
                </div>
              </div>

              {state?.error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{state.error}</p>
              )}
              {state?.success && (
                <p className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">{state.success}</p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full bg-brand text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
              >
                {pending ? "Creating…" : "Create User"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
