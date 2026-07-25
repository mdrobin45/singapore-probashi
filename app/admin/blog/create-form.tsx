"use client";

import { useActionState } from "react";
import { createBlogPostAction } from "@/app/actions/admin-blog";

type Category = { id: string; name: string };

export function CreateBlogPostForm({ categories }: { categories: Category[] }) {
  const [state, action, pending] = useActionState(createBlogPostAction, null);

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden sticky top-24">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">New Post</h3>
      </div>
      <form action={action} className="p-5 space-y-3">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Title</label>
          <input name="title" type="text" required placeholder="Post title"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-brand" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Slug</label>
          <input name="slug" type="text" required placeholder="post-url-slug"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-brand font-mono" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Category</label>
          <select name="categoryId" className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-brand bg-white">
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Excerpt</label>
          <textarea name="excerpt" rows={2} placeholder="Short summary…"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-brand resize-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Content</label>
          <textarea name="content" rows={6} required placeholder="Write the article…"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-brand resize-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Status</label>
          <select name="status" className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-brand bg-white">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Publish now</option>
          </select>
        </div>
        {state?.error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{state.error}</p>}
        {state?.success && <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">Post created!</p>}
        <button type="submit" disabled={pending}
          className="w-full bg-brand text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-brand-dark disabled:opacity-60 transition-colors">
          {pending ? "Creating…" : "Create Post"}
        </button>
      </form>
    </div>
  );
}
