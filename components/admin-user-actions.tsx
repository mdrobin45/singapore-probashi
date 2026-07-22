"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  deleteUserAction,
  toggleUserActiveAction,
  verifyUserAction,
  changeUserRoleAction,
  toggleAgentAction,
} from "@/app/actions/admin-users";

type User = {
  id: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  isAgent: boolean;
  referralCode: string | null;
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
  const ref = useRef<HTMLDivElement>(null);

  const canManage = ROLE_RANK[actorRole] > ROLE_RANK[user.role];
  const isSuperAdmin = actorRole === "SUPER_ADMIN";

  const [deleteState, deleteAction, deletePending] = useActionState(deleteUserAction, null);
  const [toggleState, toggleAction, togglePending] = useActionState(toggleUserActiveAction, null);
  const [verifyState, verifyAction, verifyPending] = useActionState(verifyUserAction, null);
  const [roleState, roleAction, rolePending] = useActionState(changeUserRoleAction, null);
  const [agentState, agentAction, agentPending] = useActionState(toggleAgentAction, null);

  const feedback = deleteState ?? toggleState ?? verifyState ?? roleState ?? agentState;

  // Refresh server component data whenever an action succeeds
  useEffect(() => {
    if (feedback?.success) router.refresh();
  }, [feedback?.success, router]);

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
            <div className="px-4 py-2 flex items-center justify-between gap-2 border-t border-border">
              <code className="text-xs font-mono font-semibold text-brand bg-brand-50 border border-brand/20 px-2 py-1 rounded-lg truncate">
                {user.referralCode}
              </code>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(user.referralCode!)}
                className="text-xs text-muted-foreground hover:text-foreground shrink-0"
              >
                Copy
              </button>
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
    </div>
  );
}
