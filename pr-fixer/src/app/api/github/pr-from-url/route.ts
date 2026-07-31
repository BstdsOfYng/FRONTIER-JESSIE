import { NextRequest, NextResponse } from "next/server";
import { parseGitHubLink, hasPRNumber, toRepoConfig } from "@/lib/github-url";
import * as github from "@/lib/github";
import { createJob } from "@/lib/store";
import { runPipeline } from "@/lib/pipeline";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'url' in request body" },
        { status: 400 }
      );
    }

    const parsed = parseGitHubLink(url);
    if (!parsed) {
      return NextResponse.json(
        {
          error:
            "Could not parse GitHub URL. Use format: https://github.com/owner/repo or https://github.com/owner/repo/pull/123",
        },
        { status: 400 }
      );
    }

    // If PR link, auto-configure repo if not already set
    const hasPR = hasPRNumber(parsed);

    // Configure the repo from the parsed URL
    process.env.GITHUB_OWNER = parsed.owner;
    process.env.GITHUB_REPO = parsed.name;

    const repoConfig = { owner: parsed.owner, name: parsed.name, fullName: parsed.owner + "/" + parsed.name };

    // If we have a PR number, fetch that specific PR
    if (hasPR) {
      if (!github.isConfigured()) {
        return NextResponse.json(
          {
            error:
              "GitHub token is not configured. Set GITHUB_TOKEN in env or enter it in Settings.",
            parsed: { owner: parsed.owner, repo: parsed.name, prNumber: parsed.prNumber },
          },
          { status: 400 }
        );
      }

      // Fetch PR details using the GitHub API
      const prUrl =
        "https://api.github.com/repos/" +
        parsed.owner +
        "/" +
        parsed.name +
        "/pulls/" +
        parsed.prNumber;

      const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      };
      if (process.env.GITHUB_TOKEN) {
        headers.Authorization = "Bearer " + process.env.GITHUB_TOKEN;
      }

      const prRes = await fetch(prUrl, { headers });
      if (!prRes.ok) {
        const errText = await prRes.text();
        return NextResponse.json(
          {
            error: "GitHub API error fetching PR #" + parsed.prNumber + ": " + prRes.status,
            detail: errText.slice(0, 500),
          },
          { status: 502 }
        );
      }

      const prData = await prRes.json();

      // Check the PR status (check runs)
      const prStatus = await github.getPRStatus(repoConfig, {
        number: prData.number,
        title: prData.title,
        body: prData.body,
        head: { ref: prData.head?.ref || "main", sha: prData.head?.sha || "" },
        base: { ref: prData.base?.ref || "main" },
        state: prData.state,
        html_url: prData.html_url,
        created_at: prData.created_at,
        updated_at: prData.updated_at,
        user: { login: prData.user?.login || "unknown" },
      });

      // If failing checks found, create a job
      if (prStatus.overall === "failure") {
        const parsedError = github.determineErrorTypeFromLog(
          prStatus.failureLogs || ""
        );

        const job = createJob({
          prName: prData.title || "PR #" + parsed.prNumber,
          repo: repoConfig.fullName,
          prNumber: parsed.prNumber,
          branch: prData.head?.ref || "main",
          errorType: parsedError.errorType,
          errorMessage: parsedError.errorMessage,
          errorLog: prStatus.failureLogs || "Check run failures detected",
        });

        // Start pipeline asynchronously
        runPipeline(job.id).catch((err: Error) =>
          console.error("Pipeline " + job.id + " failed:", err)
        );

        return NextResponse.json({
          status: "job_created",
          jobId: job.id,
          pr: {
            number: parsed.prNumber,
            title: prData.title,
            url: prData.html_url,
          },
          repo: repoConfig.fullName,
          message: "Failing checks detected — auto-fix pipeline started.",
        });
      } else {
        return NextResponse.json({
          status: "no_issues",
          pr: {
            number: parsed.prNumber,
            title: prData.title,
            url: prData.html_url,
            overall: prStatus.overall,
          },
          repo: repoConfig.fullName,
          message:
            prStatus.overall === "success"
              ? "All checks passing on this PR. No fix needed."
              : "Checks are still pending. Try again later.",
        });
      }
    }

    // Just a repo URL — configure it
    return NextResponse.json({
      status: "repo_configured",
      repo: repoConfig.fullName,
      message:
        "Repository configured. To start fixing, paste a PR link or start the poller from Settings.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
