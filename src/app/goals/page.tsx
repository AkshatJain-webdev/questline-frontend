"use client";

import { useQuery } from "@tanstack/react-query";

import { listGoals } from "@/lib/api";

export default function GoalsPage() {
  const goals = useQuery({ queryKey: ["goals"], queryFn: listGoals });

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Goals</h1>

      {goals.isPending && <p className="text-zinc-500">Loading goals...</p>}
      {goals.isError && <p className="text-red-600">{goals.error.message}</p>}
      {goals.data?.length === 0 && <p className="text-zinc-500">No goals yet.</p>}

      <ul className="space-y-2">
        {goals.data?.map((goal) => (
          <li
            key={goal.id}
            className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4"
          >
            <span
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: goal.color }}
            />
            <span className="flex-1 font-medium">{goal.title}</span>
            <span className="text-sm text-zinc-500">{goal.weekly_min_minutes} min/week</span>
            {goal.target_date && (
              <span className="text-sm text-zinc-500">by {goal.target_date}</span>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
