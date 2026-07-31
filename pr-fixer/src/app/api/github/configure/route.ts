import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.owner && body.name) {
      process.env.GITHUB_OWNER = body.owner;
      process.env.GITHUB_REPO = body.name;
    }
    if (body.token) {
      process.env.GITHUB_TOKEN = body.token;
    }
    return NextResponse.json({
      status: "configured",
      repo: body.owner + "/" + body.name,
      note: "Configuration stored in memory for this session. Set env vars for persistence.",
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
