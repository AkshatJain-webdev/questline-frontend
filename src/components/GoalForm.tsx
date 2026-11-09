"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createGoal, Goal, updateGoal } from "@/lib/api";

// With a goal it edits that goal; without one it creates a new goal.
export function GoalForm({ goal, onClose }: { goal?: Goal; onClose: () => void }) {
  const [title, setTitle] = useState(goal?.title ?? "");
  const [description, setDescription] = useState(goal?.description ?? "");
  const [color, setColor] = useState(goal?.color ?? "#2563eb");
  const [weeklyMinutes, setWeeklyMinutes] = useState(String(goal?.weekly_min_minutes ?? 120));
  const [targetDate, setTargetDate] = useState(goal?.target_date ?? "");
  const [archived, setArchived] = useState(goal?.archived ?? false);

  const queryClient = useQueryClient();

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      onClose();
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="goal-title">Title</Label>
        <Input
          id="goal-title"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal-description">Description</Label>
        <Textarea
          id="goal-description"
          rows={2}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-[auto_1fr_1fr] gap-4">
        <div className="space-y-2">
          <Label htmlFor="goal-color">Colour</Label>
          <Input
            id="goal-color"
            className="w-14 cursor-pointer p-1"
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="goal-weekly-minutes">Minutes per week</Label>
          <Input
            id="goal-weekly-minutes"
            type="number"
            min={0}
            required
            value={weeklyMinutes}
            onChange={(event) => setWeeklyMinutes(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="goal-target-date">Target date</Label>
          <Input
            id="goal-target-date"
            type="date"
            value={targetDate}
            onChange={(event) => setTargetDate(event.target.value)}
          />
        </div>
      </div>

      {goal && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="goal-archived"
            checked={archived}
            onCheckedChange={(checked) => setArchived(checked === true)}
          />
          <Label htmlFor="goal-archived">Archived</Label>
        </div>
      )}

      {save.error && <p className="text-sm text-destructive">{save.error.message}</p>}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending}>
          Save
        </Button>
      </DialogFooter>
    </form>
  );
}
