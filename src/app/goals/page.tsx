"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { GoalForm } from "@/components/GoalForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteGoal, Goal, listGoals } from "@/lib/api";

const ACTION_ICON_CLASSES = "text-primary hover:bg-primary/10 hover:text-primary";

export default function GoalsPage() {
  const goals = useQuery({ queryKey: ["goals"], queryFn: listGoals });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  function openForm(goal?: Goal) {
    setEditingGoal(goal);
    setIsFormOpen(true);
  }

  const queryClient = useQueryClient();
  const removeGoal = useMutation({
    mutationFn: (goalId: string) => deleteGoal(goalId),
    onSuccess: () => {
      // Other goals' trees can have prerequisites on the deleted nodes.
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["nodes"] });
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      setGoalToDelete(null);
    },
  });

  function closeDeleteDialog() {
    setGoalToDelete(null);
    removeGoal.reset();
  }

  const activeGoalsFirst = [...(goals.data ?? [])].sort(
    (first, second) => Number(first.archived) - Number(second.archived),
  );

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
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
            <Card
              className={`relative flex-row items-center gap-3 p-4 transition-colors hover:bg-accent ${
                goal.archived ? "opacity-50" : ""
              }`}
            >
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: goal.color }}
              />
              {/* The ::after layer stretches this link over the whole card. */}
              <Link
                className="flex-1 font-medium after:absolute after:inset-0"
                href={`/goals/${goal.id}`}
              >
                {goal.title}
              </Link>
              <span className="text-sm text-muted-foreground">
                {goal.weekly_min_minutes} min/week
              </span>
              {goal.target_date && (
                <span className="text-sm text-muted-foreground">by {goal.target_date}</span>
              )}
              <div className="relative z-10 flex items-center">
                <Button
                  className={ACTION_ICON_CLASSES}
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${goal.title}`}
                  onClick={() => openForm(goal)}
                >
                  <Pencil />
                </Button>
                <Button
                  className={ACTION_ICON_CLASSES}
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${goal.title}`}
                  onClick={() => setGoalToDelete(goal)}
                >
                  <Trash2 />
                </Button>
              </div>
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

      <AlertDialog
        open={goalToDelete !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeDeleteDialog();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this goal?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{goalToDelete?.title}&rdquo; and all of its nodes will be removed. This
              can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {removeGoal.error && (
            <p className="text-sm text-destructive">{removeGoal.error.message}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Keep goal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={removeGoal.isPending}
              onClick={(event) => {
                // Stays open until the delete finishes, so a failure can be shown here.
                event.preventDefault();
                if (goalToDelete) removeGoal.mutate(goalToDelete.id);
              }}
            >
              Delete goal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
