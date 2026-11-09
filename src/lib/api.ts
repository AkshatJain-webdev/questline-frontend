export type Goal = {
  id: string;
  title: string;
  description: string;
  color: string;
  weekly_min_minutes: number;
  target_date: string | null;
  archived: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set");
}

async function request<ResponseBody>(path: string): Promise<ResponseBody> {
  const response = await fetch(`${API_URL}/api${path}`);
  if (!response.ok) {
    // An unhandled server error has a plain-text body, not our JSON shape.
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.detail ?? `Request failed with status ${response.status}`);
  }
  return response.json();
}

export function listGoals(): Promise<Goal[]> {
  return request("/goals");
}
