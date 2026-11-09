"use client";

import {
  Background,
  ConnectionMode,
  Controls,
  Edge,
  Handle,
  MarkerType,
  Node as FlowNode,
  NodeProps,
  Position,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTheme } from "next-themes";

import { Goal, GoalNode, GoalTree, NodeStatus } from "@/lib/api";
import { STATUS_COLORS } from "@/lib/statusColors";
import { COLUMN_WIDTH, layoutTree, ROW_HEIGHT } from "@/lib/treeLayout";

type TreeBoxData = {
  title: string;
  status: NodeStatus;
  estMinutes: number;
  optional: boolean;
  // Only set on rollups, e.g. "2 of 3".
  rollupProgress: string | null;
  isSelected: boolean;
};

type OtherGoalBoxData = { goalTitle: string; title: string };

// The points on a box where a line can attach.
function BoxHandles() {
  return (
    <>
      <Handle id="left" type="source" position={Position.Left} className="invisible" />
      <Handle id="right" type="source" position={Position.Right} className="invisible" />
    </>
  );
}

function TreeBox({ data }: NodeProps<FlowNode<TreeBoxData, "treeBox">>) {
  const shapeClasses = data.rollupProgress ? "rounded-full px-5" : "rounded-lg px-3";
  const outlineClasses = data.optional ? "border-dashed" : "border-solid";
  const selectedClasses = data.isSelected ? "ring-2 ring-primary ring-offset-2" : "";

  return (
    <div
      className={`w-60 cursor-pointer border-2 border-(--status) bg-(--status)/10 py-2 ring-offset-background ${shapeClasses} ${outlineClasses} ${selectedClasses}`}
      style={{ "--status": STATUS_COLORS[data.status] } as React.CSSProperties}
    >
      <BoxHandles />
      <div className="truncate text-sm font-medium">{data.title}</div>
      <div className="text-xs text-muted-foreground">
        {data.rollupProgress ?? `${data.estMinutes} min`}
      </div>
    </div>
  );
}

function OtherGoalBox({ data }: NodeProps<FlowNode<OtherGoalBoxData, "otherGoalBox">>) {
  return (
    <div className="w-48 rounded-md border bg-muted px-2 py-1 text-muted-foreground">
      <BoxHandles />
      <div className="truncate text-[10px] uppercase">{data.goalTitle}</div>
      <div className="truncate text-xs">{data.title}</div>
    </div>
  );
}

const NODE_TYPES = { treeBox: TreeBox, otherGoalBox: OtherGoalBox };

function isRollup(node: GoalNode, nodes: GoalNode[]): boolean {
  return nodes.some((child) => child.parent_id === node.id && !child.optional);
}

function rollupProgress(node: GoalNode, tree: GoalTree, nodesById: Map<string, GoalNode>): string {
  const prerequisiteNodes = tree.prerequisites
    .filter((prerequisite) => prerequisite.node_id === node.id)
    .flatMap((prerequisite) => nodesById.get(prerequisite.prerequisite_node_id) ?? []);
  const doneScore = prerequisiteNodes
    .filter((prerequisite) => prerequisite.status === "done")
    .reduce((total, prerequisite) => total + prerequisite.score, 0);
  const allScore = prerequisiteNodes.reduce((total, prerequisite) => total + prerequisite.score, 0);
  return `${doneScore} of ${node.required_open_score ?? allScore}`;
}

// Boxes in the same column are joined around their right side, so the line doesn't loop back.
function prerequisiteLineHandles(sourceColumn: number, targetColumn: number) {
  if (sourceColumn === targetColumn) return { sourceHandle: "right", targetHandle: "right" };
  if (sourceColumn < targetColumn) return { sourceHandle: "right", targetHandle: "left" };
  return { sourceHandle: "left", targetHandle: "right" };
}

function buildFlowElements(
  tree: GoalTree,
  allNodes: GoalNode[],
  goals: Goal[],
  selectedNodeId: string | null,
) {
  const nodesById = new Map(allNodes.map((node) => [node.id, node]));
  const goalTitlesById = new Map(goals.map((goal) => [goal.id, goal.title]));
  const positions = layoutTree(tree.nodes);
  const treeNodeIds = new Set(tree.nodes.map((node) => node.id));

  const treeBoxes: FlowNode[] = tree.nodes.map((node) => ({
    id: node.id,
    type: "treeBox",
    position: positions[node.id],
    data: {
      title: node.title,
      status: node.status,
      estMinutes: node.est_minutes,
      optional: node.optional,
      rollupProgress: isRollup(node, tree.nodes) ? rollupProgress(node, tree, nodesById) : null,
      isSelected: node.id === selectedNodeId,
    },
  }));

  const deepestColumn = Math.max(0, ...Object.values(positions).map((position) => position.x));
  const otherGoalNodeIds = new Set(
    tree.prerequisites
      .flatMap((prerequisite) => [prerequisite.node_id, prerequisite.prerequisite_node_id])
      .filter((nodeId) => !treeNodeIds.has(nodeId)),
  );
  const otherGoalBoxes: FlowNode[] = [...otherGoalNodeIds].flatMap((nodeId, index) => {
    const node = nodesById.get(nodeId);
    if (!node) return [];
    return {
      id: node.id,
      type: "otherGoalBox",
      position: { x: deepestColumn + COLUMN_WIDTH, y: index * ROW_HEIGHT },
      data: { goalTitle: goalTitlesById.get(node.goal_id) ?? "", title: node.title },
    };
  });

  const parentLines: Edge[] = tree.nodes.flatMap((node) =>
    node.parent_id
      ? {
          id: `parent-${node.id}`,
          source: node.parent_id,
          target: node.id,
          sourceHandle: "right",
          targetHandle: "left",
        }
      : [],
  );

  const flowNodes = [...treeBoxes, ...otherGoalBoxes];
  const columnsById = new Map(flowNodes.map((box) => [box.id, box.position.x]));

  // A required child's automatic prerequisite on its parent is already shown by the parent line.
  const explicitPrerequisites = tree.prerequisites.filter((prerequisite) => {
    const prerequisiteNode = nodesById.get(prerequisite.prerequisite_node_id);
    return !(prerequisiteNode?.parent_id === prerequisite.node_id && !prerequisiteNode.optional);
  });
  const prerequisiteLines: Edge[] = explicitPrerequisites.map((prerequisite) => ({
    id: prerequisite.id,
    source: prerequisite.prerequisite_node_id,
    target: prerequisite.node_id,
    ...prerequisiteLineHandles(
      columnsById.get(prerequisite.prerequisite_node_id) ?? 0,
      columnsById.get(prerequisite.node_id) ?? 0,
    ),
    style: { strokeDasharray: "6 4" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "var(--muted-foreground)" },
  }));

  return { flowNodes, flowEdges: [...parentLines, ...prerequisiteLines] };
}

export function GoalTreeView({
  tree,
  allNodes,
  goals,
  selectedNodeId,
  onSelectNode,
}: {
  tree: GoalTree;
  allNodes: GoalNode[];
  goals: Goal[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}) {
  const { resolvedTheme } = useTheme();
  const { flowNodes, flowEdges } = buildFlowElements(tree, allNodes, goals, selectedNodeId);

  return (
    <ReactFlow
      nodes={flowNodes}
      edges={flowEdges}
      nodeTypes={NODE_TYPES}
      colorMode={resolvedTheme === "dark" ? "dark" : "light"}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      connectionMode={ConnectionMode.Loose}
      onNodeClick={(_event, flowNode) => {
        if (flowNode.type === "treeBox") onSelectNode(flowNode.id);
      }}
      fitView
      fitViewOptions={{ maxZoom: 1 }}
    >
      <Background />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}
