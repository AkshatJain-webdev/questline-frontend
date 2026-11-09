"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { NodeForm, NodeFormValues } from "@/components/NodeForm";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createNode, GoalNode } from "@/lib/api";

export function AddNodeSheet({
  isOpen,
  goalId,
  parentId,
  treeNodes,
  onClose,
}: {
  isOpen: boolean;
  goalId: string;
  parentId: string | null;
  treeNodes: GoalNode[];
  onClose: () => void;
}) {
  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <AddNodeBody
          goalId={goalId}
          parentId={parentId}
          treeNodes={treeNodes}
          onClose={onClose}
        />
      </SheetContent>
    </Sheet>
  );
}

function AddNodeBody({
  goalId,
  parentId,
  treeNodes,
  onClose,
}: {
  goalId: string;
  parentId: string | null;
  treeNodes: GoalNode[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: (values: NodeFormValues) => createNode({ ...values, goal_id: goalId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      queryClient.invalidateQueries({ queryKey: ["nodes"] });
      onClose();
    },
  });

  return (
    <>
      <SheetHeader>
        <SheetTitle>New node</SheetTitle>
        <SheetDescription>One piece of work with an output you can check.</SheetDescription>
      </SheetHeader>
      <div className="px-4 pb-4">
        <NodeForm
          parentIdForNewNode={parentId}
          treeNodes={treeNodes}
          isSaving={create.isPending}
          errorMessage={create.error?.message}
          onSubmit={(values) => create.mutate(values)}
          onCancel={onClose}
        />
      </div>
    </>
  );
}
