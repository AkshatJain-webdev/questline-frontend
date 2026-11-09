"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { createGoal, deleteGoal, Goal, updateGoal } from "@/lib/api";

const INPUT_CLASSES = "w-full rounded border border-zinc-300 px-2 py-1";

// With a goal it edits that goal; without one it creates a new goal.
export function GoalForm({ goal, onClose }: { goal?: Goal; onClose: () => void }) {
  const [title, setTitle] = useState(goal?.title ?? "");
  const [description, setDescription] = useState(goal?.description ?? "");
  const [color, setColor] = useState(goal?.color ?? "#2563eb");
  const [weeklyMinutes, setWeeklyMinutes] = useState(String(goal?.weekly_min_minutes ?? 120));
  const [targetDate, setTargetDate] = useState(goal?.target_date ?? "");
  const [archived, setArchived] = useState(goal?.archived ?? false);

  const queryClient = useQueryClient();
  function refreshGoalsAndClose() {
    queryClient.invalidateQueries({ queryKey: ["goals"] });
    onClose();
  }

  const save = useMutation({
    mutationFn: () => {
      const fields = {
        title,
        description,
        color,
        weekly_min_minutes: Number(weeklyMinutes),
        target_date: targetDate === "" ? null : targetDate,
      };
      return goal ? updateGoal(goal.id, { ...fields, archived }) : createGoal(fields);
    },
    onSuccess: refreshGoalsAndClose,
  });

  const remove = useMutation({
    mutationFn: (goalId: string) => deleteGoal(goalId),
    onSuccess: refreshGoalsAndClose,
  });

  function confirmAndDelete(goalToDelete: Goal) {
    if (window.confirm(`Delete "${goalToDelete.title}" and all of its nodes?`)) {
      remove.mutate(goalToDelete.id);
    }
  }

  const errorMessage = save.error?.message ?? remove.error?.message;

  return (
    <form
      className="space-y-3 rounded-lg border border-zinc-300 bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate();
      }}
    >
      <label className="block text-sm">
        Title
        <input
          className={INPUT_CLASSES}
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>

      <label className="block text-sm">
        Description
        <textarea
          className={INPUT_CLASSES}
          rows={2}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>

      <div className="flex flex-wrap gap-4">
        <label className="text-sm">
          Colour
          <input
            className="block h-8 w-16"
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
          />
        </label>

        <label className="text-sm">
          Weekly minimum (minutes)
          <input
            className={INPUT_CLASSES}
            type="number"
            min={0}
            required
            value={weeklyMinutes}
            onChange={(event) => setWeeklyMinutes(event.target.value)}
          />
        </label>

        <label className="text-sm">
          Target date
          <input
            className={INPUT_CLASSES}
            type="date"
            value={targetDate}
            onChange={(event) => setTargetDate(event.target.value)}
          />
        </label>
      </div>

      {goal && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={archived}
            onChange={(event) => setArchived(event.target.checked)}
          />
          Archived
        </label>
      )}

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <div className="flex gap-2">
        <button
          className="rounded bg-zinc-900 px-3 py-1 text-sm text-white disabled:opacity-50"
          type="submit"
          disabled={save.isPending}
        >
          Save
        </button>
        <button className="rounded px-3 py-1 text-sm" type="button" onClick={onClose}>
          Cancel
        </button>
        {goal && (
          <button
            className="ml-auto rounded px-3 py-1 text-sm text-red-600"
            type="button"
            disabled={remove.isPending}
            onClick={() => confirmAndDelete(goal)}
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
