import { NextResponse } from "next/server";
import { exportWorkspaceDataAction } from "@/lib/actions/export";

export async function GET() {
  const result = await exportWorkspaceDataAction();

  if (!result.success || !result.data) {
    return NextResponse.json(
      { error: result.error || "Failed to generate export" },
      { status: 400 }
    );
  }

  const filename = `familycare-export-${result.data.workspace.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${new Date().toISOString().split("T")[0]}.json`;

  return new NextResponse(JSON.stringify(result.data, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
