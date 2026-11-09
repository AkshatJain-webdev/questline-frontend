export type Goal = {
  id: string;
  title: string;
  description: string;
  color: string;
  weekly_min_minutes: number;
  target_date: string | null;
  archived: boolean;
};

export type GoalFields = Omit<Goal, "id" | "archived">;

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set");
}

async function request<ResponseBody>(
  path: string,
  method: string = "GET",
  body?: unknown,
): Promise<ResponseBody> {
  const response = await fetch(`${API_URL}/api${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    // Unhandled errors have no JSON body, and FastAPI's own validation errors send detail as a list.
    const errorBody = await response.json().catch(() => null);
    const detail = errorBody?.detail;
    throw new Error(
      typeof detail === "string" ? detail : `Request failed with status ${response.status}`,
    );
  }
  // A 204 has no body to parse.
  return response.status === 204 ? (undefined as ResponseBody) : response.json();
}

export function listGoals(): Promise<Goal[]> {
  return request("/goals");
}

export function createGoal(fields: GoalFields): Promise<Goal> {
  return request("/goals", "POST", fields);
}

export function updateGoal(goalId: string, changes: Partial<Omit<Goal, "id">>): Promise<Goal> {
  return request(`/goals/${goalId}`, "PATCH", changes);
}

export function deleteGoal(goalId: string): Promise<void> {
  return request(`/goals/${goalId}`, "DELETE");
}
