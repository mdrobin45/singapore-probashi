import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, fullName: true, email: true, nidNumber: true,
      phone: true, role: true, isVerified: true, isActive: true, createdAt: true,
      wallet: { select: { balance: true } },
    },
  });
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
  ADMIN: "bg-blue-100 text-blue-700",
  MODERATOR: "bg-amber-100 text-amber-700",
  USER: "bg-gray-100 text-gray-600",
};

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">{users.length} total members</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Member</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">NID</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Phone</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Wallet</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-brand">{u.fullName.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{u.fullName}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{u.nidNumber}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{u.phone}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                      {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-foreground">
                    S${u.wallet ? Number(u.wallet.balance).toFixed(2) : "0.00"}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1">
                      {u.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                          Unverified
                        </span>
                      )}
                      {!u.isActive && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                          Deactivated
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground text-xs">
                    {u.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
