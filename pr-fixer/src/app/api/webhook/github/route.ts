import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createJob } from "@/lib/store";
import { runPipeline } from "@/lib/pipeline";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  return `sha256=${expected}` === signature;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const payload = JSON.parse(body);

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers.get("x-hub-signature-256");
      if (!signature || !verifySignature(body, signature, webhookSecret)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = req.headers.get("x-github-event");

    // Support both check_run and workflow_run events
    let conclusion: string | undefined;
    let name: string | undefined;
    let repo: string | undefined;
    let branch: string | undefined;
    let prNumber: number | undefined;

    if (event === "check_run") {
      conclusion = payload.check_run?.conclusion;
      name = payload.check_run?.name || "unknown check";
      repo = payload.repository?.full_name;
      branch = payload.check_run?.check_suite?.head_branch;
      prNumber = payload.check_run?.pull_requests?.[0]?.number;
    } else if (event === "workflow_run") {
      conclusion = payload.workflow_run?.conclusion;
      name = payload.workflow_run?.name || "unknown workflow";
      repo = payload.repository?.full_name;
      branch = payload.workflow_run?.head_branch;
      prNumber = payload.workflow_run?.pull_requests?.[0]?.number;
    }

    // Only act on failures
    if (conclusion !== "failure") {
      return NextResponse.json({
        status: "ignored",
        conclusion,
        message: "Check did not fail, no action needed",
      });
    }

    const job = createJob({
      prName: name || "unknown",
      repo: repo || "unknown/repo",
      prNumber: prNumber || 0,
      branch: branch || "main",
      errorType: "lint",
      errorMessage: "CI check failed",
      errorLog: JSON.stringify(payload, null, 2).slice(0, 2000),
    });

    // Start pipeline asynchronously
    runPipeline(job.id).catch((err) =>
      console.error(`Pipeline ${job.id} failed:`, err)
    );

    return NextResponse.json({
      status: "healing_initiated",
      jobId: job.id,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
