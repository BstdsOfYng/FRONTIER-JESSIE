import { NextResponse } from "next/server";
import { isConfigured, getRepoConfig, listOpenPRs, getPRStatus } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: "GitHub not configured. Set GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO env vars." },
      { status: 400 }
    );
  }

  try {
    const repo = getRepoConfig();
    if (!repo) {
      return NextResponse.json({ error: "Repo not configured" }, { status: 400 });
    }

    const prs = await listOpenPRs(repo);
    const results = [];
    for (let i = 0; i < prs.length; i++) {
      const status = await getPRStatus(repo, prs[i]);
      results.push(status);
    }

    return NextResponse.json({ prs: results, repo });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
