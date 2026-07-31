import { NextResponse } from "next/server";
import { getAllJobs, getStats } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const jobs = getAllJobs();
  const stats = getStats();
  return NextResponse.json({ jobs, stats });
}
