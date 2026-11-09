"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { ErrorText } from "@/components/ErrorText";
import { NodeForm } from "@/components/NodeForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { completeNode, deleteNode, GoalNode, NodeChanges, updateNode } from "@/lib/api";

export function NodeDrawer({
  node,
  treeNodes,
  onClose,
}: {
  node: GoalNode | undefined;
  treeNodes: GoalNode[];
  onClose: () => void;
}) {
  return (
    <Sheet
      open={node !== undefined}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {/* Keyed so the form and its errors start fresh for each node. */}
        {node && <NodeDrawerBody key={node.id} node={node} treeNodes={treeNodes} onClose={onClose} />}
      </SheetContent>
    </Sheet>
  );
}

function NodeDrawerBody({
  node,
  treeNodes,
  onClose,
}: {
  node: GoalNode;
  treeNodes: GoalNode[];
  onClose: () => void;
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // One change can cascade through many statuses, across goals.
  function refreshTreesAndClose() {
    queryClient.invalidateQueries({ queryKey: ["tree"] });
    queryClient.invalidateQueries({ queryKey: ["nodes"] });
    onClose();
  }

  const save = useMutation({
    mutationFn: (changes: NodeChanges) => updateNode(node.id, changes),
    onSuccess: refreshTreesAndClose,
  });
  const markDone = useMutation({
    mutationFn: () => completeNode(node.id),
    onSuccess: refreshTreesAndClose,
  });
  const remove = useMutation({
    mutationFn: () => deleteNode(node.id),
    onSuccess: refreshTreesAndClose,
  });

  return (
    <>
      <SheetHeader>
        <SheetTitle>{node.title}</SheetTitle>
        <SheetDescription>
          {node.slug} · {node.status.replace("_", " ")} · abandoned {node.abandon_count} times
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-6 px-4 pb-4">
        <NodeForm
          node={node}
          treeNodes={treeNodes}
          isSaving={save.isPending}
          errorMessage={save.error?.message}
          onSave={(changes) => save.mutate(changes)}
          onCancel={onClose}
        />

        <div className="space-y-2 border-t pt-4">
          <ErrorText message={markDone.error?.message} />
          <div className="flex justify-between">
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this node?</AlertDialogTitle>
                  <AlertDialogDescription>
                    &ldquo;{node.title}&rdquo; will be removed. This can&apos;t be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <ErrorText message={remove.error?.message} />
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep node</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    disabled={remove.isPending}
                    onClick={(event) => {
                      // Stays open until the delete finishes, so a refusal can be shown here.
                      event.preventDefault();
                      remove.mutate();
                    }}
                  >
                    Delete node
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {node.status === "open" && (
              <Button disabled={markDone.isPending} onClick={() => markDone.mutate()}>
                Mark done
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
