import dotenv from "dotenv";
import fetch from "node-fetch"; // will rely on node-fetch, ensure to add dependency if not present

dotenv.config();

const BASE_URL = process.env.LEARNING_PLAN_API_BASE_URL || "https://cmfxkz7f239pfjxgt8y44e12d.agent.pa.smyth.ai";

interface ProviderSuccess {
  id?: string;
  name?: string;
  result?: { Output?: any };
  [k: string]: any;
}

export interface ManualPlanRequest {
  job_title: string;
  company_name: string;
  target_date: string;
  experience_level: string;
  focus_areas?: string;
  skill_gaps?: string;
}

export interface JobDescAnalyzeRequest {
  job_content: string;
  skill_analysis_text?: string;
  plan_duration?: string; // e.g. "7 days"
}

export async function createManualPlan(body: ManualPlanRequest) {
  return postJson("/api/create_manual_plan", body);
}

export async function analyzeJobDescription(body: JobDescAnalyzeRequest) {
  return postJson("/api/analyze_job_description", body);
}

export async function generateComprehensivePlan(body: any) {
  return postJson("/api/generate_comprehensive_plan", body);
}

async function postJson(path: string, body: any): Promise<ProviderSuccess> {
  const url = BASE_URL.replace(/\/$/, "") + path;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/plain" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "<no-body>");
    throw new Error(`Provider error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as ProviderSuccess;
  return json;
}
