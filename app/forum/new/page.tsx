import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { NewTopicForm } from "./new-topic-form";
import Link from "next/link";

export default async function NewTopicPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/forum" className="hover:text-brand transition-colors">
            Forum
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">New Discussion</span>
        </div>

        <div className="bg-white rounded-2xl border border-border p-7 shadow-2xs">
          <h1 className="text-xl font-bold text-foreground mb-1">Start a Discussion</h1>
          <p className="text-xs text-muted-foreground mb-6">
            Ask a question, share helpful updates, or discuss life & work in Singapore.
          </p>
          <NewTopicForm />
        </div>
      </div>
    </div>
  );
}
