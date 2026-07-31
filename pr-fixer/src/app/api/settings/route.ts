import { NextResponse } from "next/server";
import type { IntegrationInfo } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const info: IntegrationInfo = {
    github: process.env.GITHUB_TOKEN ? "live" : "mocked",
    e2b: process.env.E2B_API_KEY ? "live" : "mocked",
    llm:
      process.env.LLM_API_KEY || process.env.GEMINI_API_KEY ? "live" : "mocked",
  };
  return NextResponse.json(info);
}
