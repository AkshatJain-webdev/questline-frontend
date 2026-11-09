"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useState } from "react";

import { ErrorText } from "@/components/ErrorText";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addPrerequisite,
  Goal,
  GoalNode,
  Prerequisite,
  removePrerequisite,
  updateNode,
} from "@/lib/api";
import { STATUS_COLORS } from "@/lib/statusColors";

const MAX_SEARCH_RESULTS = 8;

export function PrerequisiteSection({
  node,
  prerequisites,
  allNodes,
  goals,
}: {
  node: GoalNode;
  prerequisites: Prerequisite[];
  allNodes: GoalNode[];
  goals: Goal[];
}) {
  const [searchText, setSearchText] = useState("");
  const [threshold, setThreshold] = useState(String(node.required_open_score ?? ""));

  const queryClient = useQueryClient();
  function refreshTrees() {
    queryClient.invalidateQueries({ queryKey: ["tree"] });
    queryClient.invalidateQueries({ queryKey: ["nodes"] });
  }

  const add = useMutation({
    mutationFn: (prerequisiteNodeId: string) => addPrerequisite(node.id, prerequisiteNodeId),
    onSuccess: () => {
      setSearchText("");
      refreshTrees();
    },
  });
  const remove = useMutation({
    mutationFn: (prerequisiteNodeId: string) => removePrerequisite(node.id, prerequisiteNodeId),
    onSuccess: refreshTrees,
  });
  const saveThreshold = useMutation({
    mutationFn: () =>
      updateNode(node.id, { required_open_score: threshold === "" ? null : Number(threshold) }),
    onSuccess: refreshTrees,
  });

  const goalTitlesById = new Map(goals.map((goal) => [goal.id, goal.title]));
  const nodesById = new Map(allNodes.map((candidate) => [candidate.id, candidate]));
  const prerequisiteNodes = prerequisites
    .filter((prerequisite) => prerequisite.node_id === node.id)
    .flatMap((prerequisite) => nodesById.get(prerequisite.prerequisite_node_id) ?? []);
  const linkedIds = new Set(prerequisiteNodes.map((prerequisiteNode) => prerequisiteNode.id));
  const allScore = prerequisiteNodes.reduce((total, candidate) => total + candidate.score, 0);

  const normalizedSearch = searchText.trim().toLowerCase();
  const searchResults =
    normalizedSearch === ""
      ? []
      : allNodes
          .filter(
            (candidate) =>
              candidate.id !== node.id &&
              !linkedIds.has(candidate.id) &&
              candidate.title.toLowerCase().includes(normalizedSearch),
          )
          .slice(0, MAX_SEARCH_RESULTS);

  const isThresholdChanged = threshold !== String(node.required_open_score ?? "");

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="space-y-2">
        <Label>Needs done first</Label>
        {prerequisiteNodes.length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing. This node can open right away.</p>
        )}
        <ul className="space-y-1">
          {prerequisiteNodes.map((prerequisiteNode) => {
            // A required child's link follows from its parent, so it's changed by moving the child.
            const isAutomatic = prerequisiteNode.parent_id === node.id && !prerequisiteNode.optional;
            return (
              <li key={prerequisiteNode.id} className="flex items-center gap-2 text-sm">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[prerequisiteNode.status] }}
                />
                <span className="flex-1 truncate">
                  {prerequisiteNode.title}
                  {prerequisiteNode.goal_id !== node.goal_id && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {goalTitlesById.get(prerequisiteNode.goal_id)}
                    </span>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  {prerequisiteNode.status.replace("_", " ")}
                </span>
                {isAutomatic ? (
                  <span className="text-xs text-muted-foreground">child</span>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Remove prerequisite ${prerequisiteNode.title}`}
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(prerequisiteNode.id)}
                  >
                    <X />
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <FormField id="prerequisite-search" label="Add a prerequisite">
        <Input
          id="prerequisite-search"
          placeholder="Search nodes in any goal"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
        {normalizedSearch !== "" && searchResults.length === 0 && (
          <p className="text-sm text-muted-foreground">No matching nodes.</p>
        )}
        <ul>
          {searchResults.map((candidate) => (
            <li key={candidate.id}>
              <button
                type="button"
                className="w-full cursor-pointer truncate rounded px-2 py-1 text-left text-sm hover:bg-accent"
                disabled={add.isPending}
                onClick={() => add.mutate(candidate.id)}
              >
                {candidate.title}
                <span className="text-muted-foreground">
                  {" "}
                  · {goalTitlesById.get(candidate.goal_id)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </FormField>

      <FormField id="node-threshold" label="Opens when score reaches">
        <div className="flex gap-2">
          <Input
            id="node-threshold"
            type="number"
            min={0}
            placeholder={`All of them (${allScore})`}
            value={threshold}
            onChange={(event) => setThreshold(event.target.value)}
          />
          {isThresholdChanged && (
            <Button disabled={saveThreshold.isPending} onClick={() => saveThreshold.mutate()}>
              Apply
            </Button>
          )}
        </div>
      </FormField>

      <ErrorText
        message={add.error?.message ?? remove.error?.message ?? saveThreshold.error?.message}
      />
    </div>
  );
}
