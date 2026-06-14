"use client";

import { useActionState } from "react";
import { createProjectAction } from "@/app/actions/admin-shares";

export function CreateProjectForm() {
  const [state, action, pending] = useActionState(createProjectAction, null);

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden sticky top-24">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Create New Project</h3>
      </div>
      <form action={action} className="p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Project Name</label>
          <input
            name="name"
            type="text"
            required
            placeholder="e.g. Singapore Tech Fund 2026"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Description</label>
          <textarea
            name="description"
            required
            rows={3}
            placeholder="Brief description of the project…"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Total Shares</label>
            <input
              name="totalShares"
              type="number"
              required
              min={1}
              placeholder="1000"
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Price (S$)</label>
            <input
              name="sharePrice"
              type="number"
              required
              min={0.01}
              step={0.01}
              placeholder="100.00"
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>
        </div>

        {state?.error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {state.error}
          </p>
        )}
        {state?.success && (
          <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            Project created successfully!
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-brand text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create Project"}
        </button>
      </form>
    </div>
  );
}
