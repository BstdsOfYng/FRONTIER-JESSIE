import { NextRequest, NextResponse } from "next/server";
import { createJob } from "@/lib/store";
import { runPipeline } from "@/lib/pipeline";
import type { ErrorType } from "@/lib/types";

const MOCK_PR_NAMES: Record<ErrorType, string> = {
  lint: "fix(utils): correct date formatting function",
  type_error: "feat(api): add user fetch endpoint with proper types",
  failing_test: "test(counter): add unit tests for Counter component",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const errorType: ErrorType = body.errorType || "lint";
    const repo = body.repo || "demo-user/example-repo";
    const branch = body.branch || "feature/my-branch";
    const prNumber = body.prNumber || Math.floor(Math.random() * 900) + 100;

    const job = createJob({
      prName: MOCK_PR_NAMES[errorType],
      repo,
      prNumber,
      branch,
      errorType,
      errorMessage: `Simulated ${errorType.replace("_", " ")} failure`,
    });

    // Start pipeline asynchronously
    runPipeline(job.id).catch((err) =>
      console.error(`Pipeline ${job.id} failed:`, err)
    );

    return NextResponse.json({
      status: "simulation_started",
      jobId: job.id,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
