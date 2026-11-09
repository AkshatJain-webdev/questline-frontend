"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { ErrorText } from "@/components/ErrorText";
import { FormField } from "@/components/FormField";
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
      <FormField id="goal-title" label="Title">
        <Input
          id="goal-title"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </FormField>

      <FormField id="goal-description" label="Description">
        <Textarea
          id="goal-description"
          rows={2}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </FormField>

      <div className="grid grid-cols-[auto_1fr_1fr] gap-4">
        <FormField id="goal-color" label="Colour">
          <Input
            id="goal-color"
            className="w-14 cursor-pointer p-1"
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
          />
        </FormField>

        <FormField id="goal-weekly-minutes" label="Minutes per week">
          <Input
            id="goal-weekly-minutes"
            type="number"
            min={0}
            required
            value={weeklyMinutes}
            onChange={(event) => setWeeklyMinutes(event.target.value)}
          />
        </FormField>

        <FormField id="goal-target-date" label="Target date">
          <Input
            id="goal-target-date"
            type="date"
            value={targetDate}
            onChange={(event) => setTargetDate(event.target.value)}
          />
        </FormField>
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

      <ErrorText message={save.error?.message} />

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
