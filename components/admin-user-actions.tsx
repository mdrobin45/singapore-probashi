"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  deleteUserAction,
  updateUserAction,
  toggleUserActiveAction,
  verifyUserAction,
  changeUserRoleAction,
  toggleAgentAction,
  adjustWalletAction,
} from "@/app/actions/admin-users";

type User = {
  id: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  isAgent: boolean;
  referralCode: string | null;
  fullName: string;
  email: string;
  phone: string | null;
};

type Props = {
  user: User;
  actorRole: string;
};

const ROLE_RANK: Record<string, number> = {
  USER: 0, MODERATOR: 1, ADMIN: 2, SUPER_ADMIN: 3,
};

const ALL_ROLES = ["USER", "MODERATOR", "ADMIN", "SUPER_ADMIN"];

export function UserActionsMenu({ user, actorRole }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const origin = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const referralLink = user.referralCode ? `${origin}/register?ref=${user.referralCode}` : "";

  function copy(text: string, which: "code" | "link") {
    navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  }

  const canManage = ROLE_RANK[actorRole] > ROLE_RANK[user.role];
  const isSuperAdmin = actorRole === "SUPER_ADMIN";

  const [deleteState, deleteAction, deletePending] = useActionState(deleteUserAction, null);
  const [toggleState, toggleAction, togglePending] = useActionState(toggleUserActiveAction, null);
  const [verifyState, verifyAction, verifyPending] = useActionState(verifyUserAction, null);
  const [roleState, roleAction, rolePending] = useActionState(changeUserRoleAction, null);
  const [agentState, agentAction, agentPending] = useActionState(toggleAgentAction, null);
  const [editState, editAction, editPending] = useActionState(updateUserAction, null);
  const [walletState, walletAction, walletPending] = useActionState(adjustWalletAction, null);

  const feedback = deleteState ?? toggleState ?? verifyState ?? roleState ?? agentState;

  // Refresh server component data whenever an action succeeds
  useEffect(() => {
    if (feedback?.success) router.refresh();
  }, [feedback?.success, router]);

  useEffect(() => {
    if (editState?.success) {
      setEditOpen(false);
      router.refresh();
    }
  }, [editState, router]);

  useEffect(() => {
    if (walletState?.success) router.refresh();
  }, [walletState, router]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowRoleSelect(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!canManage && !isSuperAdmin) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <div ref={ref} className="relative">
      {/* 3-dot trigger */}
      <button
        onClick={() => { setOpen((v) => !v); setShowRoleSelect(false); }}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="User actions"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl border border-border shadow-lg z-50 py-1 overflow-hidden">
          {/* Feedback */}
          {feedback && (
            <div className={`px-3 py-2 text-xs font-medium border-b border-border ${feedback.error ? "text-red-600 bg-red-50" : "text-green-700 bg-green-50"}`}>
              {feedback.error ?? feedback.success}
            </div>
          )}

          {/* Edit */}
          {canManage && (
            <button
              onClick={() => { setEditOpen(true); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <svg className="w-4 h-4 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit user
            </button>
          )}

          {/* Verify */}
          {!user.isVerified && canManage && (
            <form action={verifyAction} onSubmit={() => setOpen(false)}>
              <input type="hidden" name="userId" value={user.id} />
              <button
                type="submit"
                disabled={verifyPending}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                {verifyPending ? "Verifying…" : "Verify email"}
              </button>
            </form>
          )}

          {/* Ban / Unban */}
          {canManage && (
            <form action={toggleAction} onSubmit={() => setOpen(false)}>
              <input type="hidden" name="userId" value={user.id} />
              <input type="hidden" name="isActive" value={String(user.isActive)} />
              <button
                type="submit"
                disabled={togglePending}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  {user.isActive
                    ? <><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></>
                    : <><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></>}
                </svg>
                {togglePending ? "Updating…" : user.isActive ? "Ban user" : "Unban user"}
              </button>
            </form>
          )}

          {/* Wallet adjustment */}
          {canManage && (
            <button
              onClick={() => { setWalletOpen(true); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <svg className="w-4 h-4 text-green-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Adjust wallet
            </button>
          )}

          {/* Agent / referral commission */}
          {canManage && (
            <form action={agentAction} onSubmit={() => setOpen(false)}>
              <input type="hidden" name="userId" value={user.id} />
              <input type="hidden" name="isAgent" value={String(user.isAgent)} />
              <button
                type="submit"
                disabled={agentPending}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4 text-brand shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6M2 7h20M12 3v4M8 7l4-4 4 4" />
                </svg>
                {agentPending ? "Updating…" : user.isAgent ? "Remove agent status" : "Make agent"}
              </button>
            </form>
          )}
          {user.isAgent && user.referralCode && (
            <div className="px-4 py-2.5 border-t border-border space-y-2">
              <div className="flex items-center justify-between gap-2">
                <code className="text-[11px] font-mono text-foreground bg-muted border border-border px-2 py-1 rounded-lg truncate">
                  {referralLink}
                </code>
                <button
                  type="button"
                  onClick={() => copy(referralLink, "link")}
                  className="text-xs text-muted-foreground hover:text-foreground shrink-0"
                >
                  {copied === "link" ? "Copied!" : "Copy link"}
                </button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono font-semibold text-brand bg-brand-50 border border-brand/20 px-2 py-1 rounded-lg truncate">
                  {user.referralCode}
                </code>
                <button
                  type="button"
                  onClick={() => copy(user.referralCode!, "code")}
                  className="text-xs text-muted-foreground hover:text-foreground shrink-0"
                >
                  {copied === "code" ? "Copied!" : "Copy code"}
                </button>
              </div>
            </div>
          )}

          {/* Change role — SUPER_ADMIN only */}
          {isSuperAdmin && (
            <>
              <button
                onClick={() => setShowRoleSelect((v) => !v)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <svg className="w-4 h-4 text-purple-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
                Change role
                <svg className={`w-3.5 h-3.5 ml-auto text-muted-foreground transition-transform ${showRoleSelect ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
              </button>

              {showRoleSelect && (
                <form action={roleAction} onSubmit={() => { setOpen(false); setShowRoleSelect(false); }} className="px-3 pb-2.5 pt-1 border-t border-border">
                  <input type="hidden" name="userId" value={user.id} />
                  <select
                    name="role"
                    defaultValue={user.role}
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand mb-2"
                  >
                    {ALL_ROLES.map((r) => (
                      <option key={r} value={r}>{r.replace("_", " ")}</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={rolePending}
                    className="w-full text-sm font-semibold py-1.5 rounded-lg bg-brand text-white hover:bg-brand-dark transition-colors disabled:opacity-50"
                  >
                    {rolePending ? "Saving…" : "Save role"}
                  </button>
                </form>
              )}
            </>
          )}

          {/* Divider + Delete */}
          {canManage && (
            <>
              <div className="border-t border-border my-1" />
              <form
                action={deleteAction}
                onSubmit={(e) => {
                  if (!confirm("Delete this user permanently? This cannot be undone.")) e.preventDefault();
                  else setOpen(false);
                }}
              >
                <input type="hidden" name="userId" value={user.id} />
                <button
                  type="submit"
                  disabled={deletePending}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                  </svg>
                  {deletePending ? "Deleting…" : "Delete user"}
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {editOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 pb-20 lg:pb-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditOpen(false)} />
          <div className="relative bg-white rounded-2xl border border-border shadow-xl w-full max-w-md max-h-[calc(100vh-6rem)] lg:max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-foreground">Edit User</h2>
              <button onClick={() => setEditOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form action={editAction} className="p-6 space-y-4">
              <input type="hidden" name="userId" value={user.id} />

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Full Name</label>
                <input
                  name="fullName"
                  type="text"
                  required
                  defaultValue={user.fullName}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={user.email}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Phone</label>
                <input
                  name="phone"
                  type="text"
                  required
                  defaultValue={user.phone ?? ""}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                />
              </div>

              {editState?.error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{editState.error}</p>
              )}

              <button
                type="submit"
                disabled={editPending}
                className="w-full bg-brand text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
              >
                {editPending ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {walletOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 pb-20 lg:pb-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setWalletOpen(false)} />
          <div className="relative bg-white rounded-2xl border border-border shadow-xl w-full max-w-sm">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-foreground">Adjust Wallet — {user.fullName}</h2>
              <button onClick={() => setWalletOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form action={walletAction} className="p-6 space-y-4">
              <input type="hidden" name="userId" value={user.id} />

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="cursor-pointer">
                    <input type="radio" name="direction" value="CREDIT" defaultChecked className="sr-only peer" />
                    <div className="border border-border rounded-lg px-3 py-2 text-sm font-medium text-center transition-colors peer-checked:bg-green-50 peer-checked:border-green-400 peer-checked:text-green-700 text-muted-foreground">
                      + Credit
                    </div>
                  </label>
                  <label className="cursor-pointer">
                    <input type="radio" name="direction" value="DEBIT" className="sr-only peer" />
                    <div className="border border-border rounded-lg px-3 py-2 text-sm font-medium text-center transition-colors peer-checked:bg-red-50 peer-checked:border-red-400 peer-checked:text-red-700 text-muted-foreground">
                      − Debit
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Amount (৳)</label>
                <input
                  name="amount"
                  type="number"
                  min={0.01}
                  step={0.01}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Reason</label>
                <textarea
                  name="reason"
                  required
                  rows={2}
                  placeholder="e.g. Refund for cancelled taxi booking"
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                />
              </div>

              {walletState?.error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{walletState.error}</p>
              )}
              {walletState?.success && (
                <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{walletState.success}</p>
              )}

              <button
                type="submit"
                disabled={walletPending}
                className="w-full bg-brand text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
              >
                {walletPending ? "Saving…" : "Apply Adjustment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
