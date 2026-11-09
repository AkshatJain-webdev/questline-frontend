export const COLUMN_WIDTH = 300;
export const ROW_HEIGHT = 96;

export type Position = { x: number; y: number };

// Takes [{ id: "a", parent_id: null }, { id: "b", parent_id: "a" }] and returns { a: { x, y }, b: { x, y } }.
export function layoutTree(
  nodes: { id: string; parent_id: string | null }[],
): Record<string, Position> {
  const childIdsByParentId = new Map<string | null, string[]>();
  for (const node of nodes) {
    const siblings = childIdsByParentId.get(node.parent_id) ?? [];
    siblings.push(node.id);
    childIdsByParentId.set(node.parent_id, siblings);
  }

  const positions: Record<string, Position> = {};
  let nextLeafRow = 0;

  // Returns the row it placed the node on, so a parent can centre itself on its children.
  function placeNode(nodeId: string, depth: number): number {
    const childIds = childIdsByParentId.get(nodeId) ?? [];
    let row: number;
    if (childIds.length === 0) {
      row = nextLeafRow;
      nextLeafRow += 1;
    } else {
      const childRows = childIds.map((childId) => placeNode(childId, depth + 1));
      row = (childRows[0] + childRows[childRows.length - 1]) / 2;
    }
    positions[nodeId] = { x: depth * COLUMN_WIDTH, y: row * ROW_HEIGHT };
    return row;
  }

  for (const rootId of childIdsByParentId.get(null) ?? []) {
    placeNode(rootId, 0);
  }
  return positions;
}
