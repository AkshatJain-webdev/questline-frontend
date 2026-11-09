"use client";

import { useState } from "react";

import { ErrorText } from "@/components/ErrorText";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { GoalNode, NodeChanges } from "@/lib/api";

// Radix's Select doesn't allow an empty value, so this stands for "no parent".
const NO_PARENT = "none";

const FOCUS_LEVELS = [
  { value: "low", label: "Low", color: "var(--focus-low)" },
  { value: "medium", label: "Medium", color: "var(--focus-medium)" },
  { value: "deep", label: "Deep", color: "var(--focus-deep)" },
];

// Each segment sets --level to its own colour.
const FOCUS_SEGMENT_CLASSES =
  "flex-1 rounded-md text-muted-foreground hover:bg-background/60 data-[state=on]:bg-background data-[state=on]:font-medium data-[state=on]:text-(--level) data-[state=on]:shadow-sm data-[state=on]:ring-1 data-[state=on]:ring-(--level)/40 data-[state=on]:hover:bg-background data-[state=on]:hover:text-(--level)";

export function NodeForm({
  node,
  treeNodes,
  isSaving,
  errorMessage,
  onSave,
  onCancel,
}: {
  node: GoalNode;
  treeNodes: GoalNode[];
  isSaving: boolean;
  errorMessage?: string;
  onSave: (changes: NodeChanges) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(node.title);
  const [description, setDescription] = useState(node.description);
  const [doneCriteria, setDoneCriteria] = useState(node.done_criteria);
  const [parentId, setParentId] = useState(node.parent_id ?? NO_PARENT);
  const [optional, setOptional] = useState(node.optional);
  const [score, setScore] = useState(String(node.score));
  const [estMinutes, setEstMinutes] = useState(String(node.est_minutes));
  const [focus, setFocus] = useState(node.focus);
  const [tags, setTags] = useState(node.tags.join(", "));

  function saveChangedFields() {
    const newParentId = parentId === NO_PARENT ? null : parentId;
    const newTags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    const changes: NodeChanges = {};
    if (title !== node.title) changes.title = title;
    if (description !== node.description) changes.description = description;
    if (doneCriteria !== node.done_criteria) changes.done_criteria = doneCriteria;
    if (newParentId !== node.parent_id) changes.parent_id = newParentId;
    if (optional !== node.optional) changes.optional = optional;
    if (Number(score) !== node.score) changes.score = Number(score);
    if (Number(estMinutes) !== node.est_minutes) changes.est_minutes = Number(estMinutes);
    if (focus !== node.focus) changes.focus = focus;
    if (newTags.join(",") !== node.tags.join(",")) changes.tags = newTags;
    onSave(changes);
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        saveChangedFields();
      }}
    >
      <FormField id="node-title" label="Title">
        <Input
          id="node-title"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </FormField>

      <FormField id="node-description" label="Description">
        <Textarea
          id="node-description"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </FormField>

      <FormField id="node-done-criteria" label="Done criteria">
        <Textarea
          id="node-done-criteria"
          rows={2}
          required
          value={doneCriteria}
          onChange={(event) => setDoneCriteria(event.target.value)}
        />
      </FormField>

      <FormField id="node-parent" label="Parent">
        <Select value={parentId} onValueChange={setParentId}>
          <SelectTrigger id="node-parent" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_PARENT}>None (top level)</SelectItem>
            {treeNodes
              .filter((treeNode) => treeNode.id !== node.id)
              .map((treeNode) => (
                <SelectItem key={treeNode.id} value={treeNode.id}>
                  {treeNode.title}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField id="node-minutes" label="Minutes">
          <Input
            id="node-minutes"
            type="number"
            min={0}
            required
            value={estMinutes}
            onChange={(event) => setEstMinutes(event.target.value)}
          />
        </FormField>

        <FormField id="node-score" label="Score">
          <Input
            id="node-score"
            type="number"
            min={0}
            required
            value={score}
            onChange={(event) => setScore(event.target.value)}
          />
        </FormField>

      </div>

      <div className="space-y-2">
        <Label id="node-focus-label">Focus</Label>
        <ToggleGroup
          aria-labelledby="node-focus-label"
          className="w-full rounded-lg bg-muted p-1"
          type="single"
          spacing={1}
          value={focus}
          onValueChange={(value) => {
            // Radix sends an empty value when the selected button is clicked again.
            if (value) setFocus(value as GoalNode["focus"]);
          }}
        >
          {FOCUS_LEVELS.map((level) => (
            <ToggleGroupItem
              key={level.value}
              className={FOCUS_SEGMENT_CLASSES}
              style={{ "--level": level.color } as React.CSSProperties}
              value={level.value}
            >
              <span className="size-2 rounded-full bg-(--level)" />
              {level.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <FormField id="node-tags" label="Tags (comma-separated)">
        <Input id="node-tags" value={tags} onChange={(event) => setTags(event.target.value)} />
      </FormField>

      <div className="flex items-center gap-2">
        <Checkbox
          id="node-optional"
          checked={optional}
          onCheckedChange={(checked) => setOptional(checked === true)}
        />
        <Label htmlFor="node-optional">Optional (its parent can complete without it)</Label>
      </div>

      <ErrorText message={errorMessage} />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          Save
        </Button>
      </div>
    </form>
  );
}
