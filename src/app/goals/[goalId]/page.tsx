"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { GoalColorDot } from "@/components/GoalColorDot";
import { NodeDrawer } from "@/components/NodeDrawer";
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

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const errorMessage = tree.error?.message ?? allNodes.error?.message ?? goals.error?.message;
  const selectedNode = tree.data?.nodes.find((node) => node.id === selectedNodeId);

  return (
    <div className="flex h-[calc(100svh-3rem)] flex-col">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Link href="/goals" aria-label="Back to goals" className="text-muted-foreground">
          <ArrowLeft className="size-4" />
        </Link>
        {tree.data && (
          <>
            <GoalColorDot color={tree.data.goal.color} />
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
          <GoalTreeView
            tree={tree.data}
            allNodes={allNodes.data}
            goals={goals.data}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />
        )}
      </div>

      <NodeDrawer
        node={selectedNode}
        treeNodes={tree.data?.nodes ?? []}
        onClose={() => setSelectedNodeId(null)}
      />
    </div>
  );
}
