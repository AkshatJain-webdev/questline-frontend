"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { AddNodeSheet } from "@/components/AddNodeSheet";
import { GoalColorDot } from "@/components/GoalColorDot";
import { NodeDrawer } from "@/components/NodeDrawer";
import { Button } from "@/components/ui/button";
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

  const [isAddingNode, setIsAddingNode] = useState(false);
  const [newNodeParentId, setNewNodeParentId] = useState<string | null>(null);

  function startAddingNode(parentId: string | null) {
    setSelectedNodeId(null);
    setNewNodeParentId(parentId);
    setIsAddingNode(true);
  }

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
            {tree.data.nodes.length > 0 && (
              <Button className="ml-auto" size="sm" onClick={() => startAddingNode(null)}>
                <Plus />
                Add node
              </Button>
            )}
          </>
        )}
      </div>

      <div className="min-h-0 flex-1">
        {errorMessage && <p className="p-6 text-destructive">{errorMessage}</p>}
        {tree.isPending && <p className="p-6 text-muted-foreground">Loading tree...</p>}
        {tree.data?.nodes.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <Button onClick={() => startAddingNode(null)}>
              <Plus />
              Add first node
            </Button>
          </div>
        )}
        {/* Keyed on the node count so the view re-fits when boxes are added or removed. */}
        {tree.data && tree.data.nodes.length > 0 && allNodes.data && goals.data && (
          <GoalTreeView
            key={tree.data.nodes.length}
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
        onAddChild={startAddingNode}
        onClose={() => setSelectedNodeId(null)}
      />

      <AddNodeSheet
        isOpen={isAddingNode}
        goalId={goalId}
        parentId={newNodeParentId}
        treeNodes={tree.data?.nodes ?? []}
        onClose={() => setIsAddingNode(false)}
      />
    </div>
  );
}
