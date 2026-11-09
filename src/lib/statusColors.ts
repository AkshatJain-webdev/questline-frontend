import { NodeStatus } from "@/lib/api";

export const STATUS_COLORS: Record<NodeStatus, string> = {
  locked: "var(--status-locked)",
  open: "var(--status-open)",
  in_progress: "var(--status-in-progress)",
  done: "var(--status-done)",
  abandoned: "var(--status-locked)",
};
