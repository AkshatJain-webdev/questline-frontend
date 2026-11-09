"use client";

import { useQuery } from "@tanstack/react-query";
import { Pencil, Plus } from "lucide-react";
import { useState } from "react";

import { GoalForm } from "@/components/GoalForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Goal, listGoals } from "@/lib/api";

export default function GoalsPage() {
  const goals = useQuery({ queryKey: ["goals"], queryFn: listGoals });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();

  function openForm(goal?: Goal) {
    setEditingGoal(goal);
    setIsFormOpen(true);
  }

  const activeGoalsFirst = [...(goals.data ?? [])].sort(
    (first, second) => Number(first.archived) - Number(second.archived),
  );

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Goals</h1>
        <Button onClick={() => openForm()}>
          <Plus />
          New goal
        </Button>
      </div>

      {goals.isPending && <p className="text-muted-foreground">Loading goals...</p>}
      {goals.isError && <p className="text-destructive">{goals.error.message}</p>}
      {goals.data?.length === 0 && <p className="text-muted-foreground">No goals yet.</p>}

      <ul className="space-y-2">
        {activeGoalsFirst.map((goal) => (
          <li key={goal.id}>
            <Card className={`flex-row items-center gap-3 p-4 ${goal.archived ? "opacity-50" : ""}`}>
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: goal.color }}
              />
              <span className="flex-1 font-medium">{goal.title}</span>
              <span className="text-sm text-muted-foreground">
                {goal.weekly_min_minutes} min/week
              </span>
              {goal.target_date && (
                <span className="text-sm text-muted-foreground">by {goal.target_date}</span>
              )}
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Edit ${goal.title}`}
                onClick={() => openForm(goal)}
              >
                <Pencil />
              </Button>
            </Card>
          </li>
        ))}
      </ul>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoal ? "Edit goal" : "New goal"}</DialogTitle>
            <DialogDescription>A goal is one roadmap of nodes to work through.</DialogDescription>
          </DialogHeader>
          <GoalForm goal={editingGoal} onClose={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </main>
  );
}
