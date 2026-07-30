import { NextResponse } from "next/server";
import { getPollerState } from "@/lib/poller";
import { isConfigured, getRepoConfig } from "@/lib/github";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({
    ...getPollerState(),
    githubConfigured: isConfigured(),
    repo: getRepoConfig(),
  });
}
