"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { ErrorText } from "@/components/ErrorText";
import { NodeForm, NodeFormValues } from "@/components/NodeForm";
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

// Save sends only what the user actually changed.
function changedFields(node: GoalNode, values: NodeFormValues): NodeChanges {
  const changes: NodeChanges = {};
  if (values.title !== node.title) changes.title = values.title;
  if (values.description !== node.description) changes.description = values.description;
  if (values.done_criteria !== node.done_criteria) changes.done_criteria = values.done_criteria;
  if (values.parent_id !== node.parent_id) changes.parent_id = values.parent_id;
  if (values.optional !== node.optional) changes.optional = values.optional;
  if (values.score !== node.score) changes.score = values.score;
  if (values.est_minutes !== node.est_minutes) changes.est_minutes = values.est_minutes;
  if (values.focus !== node.focus) changes.focus = values.focus;
  if (values.tags.join(",") !== node.tags.join(",")) changes.tags = values.tags;
  return changes;
}

export function NodeDrawer({
  node,
  treeNodes,
  onAddChild,
  onClose,
}: {
  node: GoalNode | undefined;
  treeNodes: GoalNode[];
  onAddChild: (parentId: string) => void;
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
        {node && (
          <NodeDrawerBody
            key={node.id}
            node={node}
            treeNodes={treeNodes}
            onAddChild={onAddChild}
            onClose={onClose}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function NodeDrawerBody({
  node,
  treeNodes,
  onAddChild,
  onClose,
}: {
  node: GoalNode;
  treeNodes: GoalNode[];
  onAddChild: (parentId: string) => void;
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
          onSubmit={(values) => save.mutate(changedFields(node, values))}
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

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onAddChild(node.id)}>
                Add child
              </Button>
              {node.status === "open" && (
                <Button disabled={markDone.isPending} onClick={() => markDone.mutate()}>
                  Mark done
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
