import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseServer } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = req.nextUrl.searchParams.get("company");
  if (!company) {
    return NextResponse.json({ error: "Missing company parameter" }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from("user_progress")
    .select("problem_index, status")
    .eq("user_id", userId)
    .eq("company", company);

  if (error) {
    console.error("Supabase GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Convert to a dictionary: { "0": true, "1": false }
  const solvedStatus: Record<number, boolean> = {};
  data.forEach((row) => {
    if (row.status === "solved") {
      solvedStatus[row.problem_index] = true;
    }
  });

  return NextResponse.json(solvedStatus);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { company, problemIndex, status } = body;

  if (!company || typeof problemIndex !== "number" || !status) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from("user_progress")
    .upsert({
      user_id: userId,
      company: company,
      problem_index: problemIndex,
      status: status, // 'solved'
    }, {
      onConflict: 'user_id, company, problem_index'
    });

  if (error) {
    console.error("Supabase POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
