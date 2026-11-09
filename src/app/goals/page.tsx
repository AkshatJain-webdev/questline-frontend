"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { GoalForm } from "@/components/GoalForm";
import { listGoals } from "@/lib/api";

export default function GoalsPage() {
  const goals = useQuery({ queryKey: ["goals"], queryFn: listGoals });
  const [isCreating, setIsCreating] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  const activeGoalsFirst = [...(goals.data ?? [])].sort(
    (first, second) => Number(first.archived) - Number(second.archived),
  );

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Goals</h1>
        {!isCreating && (
          <button
            className="rounded bg-zinc-900 px-3 py-1 text-sm text-white"
            onClick={() => setIsCreating(true)}
          >
            New goal
          </button>
        )}
      </div>

      {isCreating && (
        <div className="mb-4">
          <GoalForm onClose={() => setIsCreating(false)} />
        </div>
      )}

      {goals.isPending && <p className="text-zinc-500">Loading goals...</p>}
      {goals.isError && <p className="text-red-600">{goals.error.message}</p>}
      {goals.data?.length === 0 && !isCreating && <p className="text-zinc-500">No goals yet.</p>}

      <ul className="space-y-2">
        {activeGoalsFirst.map((goal) =>
          editingGoalId === goal.id ? (
            <li key={goal.id}>
              <GoalForm goal={goal} onClose={() => setEditingGoalId(null)} />
            </li>
          ) : (
            <li
              key={goal.id}
              className={`flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4 ${
                goal.archived ? "opacity-50" : ""
              }`}
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
              <button
                className="text-sm text-zinc-600 underline"
                onClick={() => setEditingGoalId(goal.id)}
              >
                Edit
              </button>
            </li>
          ),
        )}
      </ul>
    </main>
  );
}
