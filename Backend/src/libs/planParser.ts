export interface ParsedTask {
  title: string;
  type?: string;
  duration?: number;
  gap?: string;
  resources?: string;
}

export interface ParsedDay {
  day: number;
  tasks: ParsedTask[];
}

export function parseDailyPlanJSON(dailyPlan?: any): ParsedDay[] {
  if (!dailyPlan) return [];
  try {
    const arr = typeof dailyPlan === "string" ? JSON.parse(dailyPlan) : dailyPlan;
    if (!Array.isArray(arr)) return [];
    return arr.map((d: any, i: number) => ({
      day: Number(d?.day ?? i + 1),
      tasks: Array.isArray(d?.tasks) ? d.tasks.slice(0, 3).map((t: any) => ({
        title: String(t?.title ?? "Task"),
        type: t?.type ? String(t.type) : undefined,
        duration: t?.duration != null ? Number(t.duration) : undefined,
        gap: t?.gap ? String(t.gap) : undefined,
        resources: t?.resources ? String(t.resources) : undefined,
      })) : [],
    }));
  } catch {
    return [];
  }
}
