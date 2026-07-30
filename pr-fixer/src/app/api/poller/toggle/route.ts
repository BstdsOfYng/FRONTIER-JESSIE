import { NextRequest, NextResponse } from "next/server";
import { startPolling, stopPolling, getPollerState } from "@/lib/poller";
import { getRepoConfig } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === "start") {
      const repo = getRepoConfig();
      if (!repo) {
        return NextResponse.json({ error: "Repo not configured. Set GITHUB_OWNER and GITHUB_REPO." }, { status: 400 });
      }
      startPolling(repo, body.intervalSec || 30);
      return NextResponse.json({ status: "started", ...getPollerState() });
    } else {
      stopPolling();
      return NextResponse.json({ status: "stopped", ...getPollerState() });
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
