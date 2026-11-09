"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";

import { getGoalTree, listGoals, listNodes } from "@/lib/api";

// React Flow only runs in the browser.
const GoalTreeView = dynamic(
  () => import("@/components/GoalTreeView").then((module) => module.GoalTreeView),
  { ssr: false },
);

export default function GoalTreePage() {
  const { goalId } = useParams<{ goalId: string }>();
  const tree = useQuery({ queryKey: ["tree", goalId], queryFn: () => getGoalTree(goalId) });
  const allNodes = useQuery({ queryKey: ["nodes"], queryFn: listNodes });
  const goals = useQuery({ queryKey: ["goals"], queryFn: listGoals });

  const errorMessage = tree.error?.message ?? allNodes.error?.message ?? goals.error?.message;

  return (
    <div className="flex h-[calc(100svh-3rem)] flex-col">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Link href="/goals" aria-label="Back to goals" className="text-muted-foreground">
          <ArrowLeft className="size-4" />
        </Link>
        {tree.data && (
          <>
            <span
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: tree.data.goal.color }}
            />
            <h1 className="font-semibold">{tree.data.goal.title}</h1>
          </>
        )}
      </div>

      <div className="min-h-0 flex-1">
        {errorMessage && <p className="p-6 text-destructive">{errorMessage}</p>}
        {tree.isPending && <p className="p-6 text-muted-foreground">Loading tree...</p>}
        {tree.data?.nodes.length === 0 && (
          <p className="p-6 text-muted-foreground">This goal has no nodes yet.</p>
        )}
        {tree.data && tree.data.nodes.length > 0 && allNodes.data && goals.data && (
          <GoalTreeView tree={tree.data} allNodes={allNodes.data} goals={goals.data} />
        )}
      </div>
    </div>
  );
}
