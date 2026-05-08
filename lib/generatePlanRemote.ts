import type { UserProfile, WorkoutDay } from "@/data/types";
import { apiFetch } from "@/stores/authStore";
import { generatePlan as localGeneratePlan } from "./generatePlan";

export async function generatePlanRemote(
  profile: UserProfile,
  token: string | null
): Promise<WorkoutDay[]> {
  if (!token) return localGeneratePlan(profile);

  const res = await apiFetch<{ days: WorkoutDay[] }>(
    "/api/generate-plan",
    { method: "POST", body: JSON.stringify(profile) },
    token
  );

  if (res.error || !res.data?.days?.length) {
    return localGeneratePlan(profile);
  }

  return res.data.days;
}
