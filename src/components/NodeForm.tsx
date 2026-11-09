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
import { GoalNode, NewNode } from "@/lib/api";

export type NodeFormValues = Omit<NewNode, "goal_id">;

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

function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// With a node it edits that node; without one it collects the values for a new node.
export function NodeForm({
  node,
  parentIdForNewNode = null,
  treeNodes,
  isSaving,
  errorMessage,
  onSubmit,
  onCancel,
}: {
  node?: GoalNode;
  parentIdForNewNode?: string | null;
  treeNodes: GoalNode[];
  isSaving: boolean;
  errorMessage?: string;
  onSubmit: (values: NodeFormValues) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(node?.title ?? "");
  // Follows the title until the user types their own slug.
  const [typedSlug, setTypedSlug] = useState<string | null>(null);
  const [description, setDescription] = useState(node?.description ?? "");
  const [doneCriteria, setDoneCriteria] = useState(node?.done_criteria ?? "");
  const [parentId, setParentId] = useState(
    (node ? node.parent_id : parentIdForNewNode) ?? NO_PARENT,
  );
  const [optional, setOptional] = useState(node?.optional ?? false);
  const [score, setScore] = useState(String(node?.score ?? 1));
  const [estMinutes, setEstMinutes] = useState(String(node?.est_minutes ?? 30));
  const [focus, setFocus] = useState<GoalNode["focus"]>(node?.focus ?? "medium");
  const [tags, setTags] = useState(node?.tags.join(", ") ?? "");

  const slug = node?.slug ?? typedSlug ?? slugFromTitle(title);

  function submitValues() {
    onSubmit({
      slug,
      title,
      description,
      done_criteria: doneCriteria,
      parent_id: parentId === NO_PARENT ? null : parentId,
      optional,
      score: Number(score),
      est_minutes: Number(estMinutes),
      focus,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ""),
    });
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        submitValues();
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

      {!node && (
        <FormField id="node-slug" label="Slug (permanent once saved)">
          <Input
            id="node-slug"
            required
            value={slug}
            onChange={(event) => setTypedSlug(event.target.value)}
          />
        </FormField>
      )}

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
              .filter((treeNode) => treeNode.id !== node?.id)
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
