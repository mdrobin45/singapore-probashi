import { prisma } from "@/lib/prisma";

async function getPosts() {
  return prisma.lostFoundPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { fullName: true, email: true } } },
  });
}

const TYPE_STYLES = {
  LOST: "bg-red-100 text-red-700",
  FOUND: "bg-green-100 text-green-700",
};

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-700",
  REMOVED: "bg-gray-100 text-gray-600",
};

export default async function AdminLostFoundPage() {
  const posts = await getPosts();
  const open = posts.filter((p) => p.status === "OPEN");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Lost & Found</h1>
        <p className="text-sm text-muted-foreground">{open.length} open · {posts.length} total</p>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Post</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Posted by</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Location</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-3.5">
                    <p className="font-medium text-foreground max-w-52 truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${TYPE_STYLES[p.type]}`}>
                      {p.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-foreground">{p.user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{p.user.email}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">{p.location ?? "—"}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_STYLES[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                    {p.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">No posts yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
