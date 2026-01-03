import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import {
  chatTable,
  framesTable,
  projectsTable,
  usersTable,
} from "@/config/schema";
import db from "@/config/db";
import { and, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const frameId = searchParams.get("frameId");
    const projectId = searchParams.get("projectId");
    console.log("DEBUG", searchParams, frameId, projectId);

    if (!frameId || !projectId) {
      throw new Error("Missing frameId or projectId");
    }

    const frameResult = await db
      .select()
      .from(framesTable)
      .where(eq(framesTable.frameId, frameId));

    const chatResult = await db
      .select()
      .from(chatTable)
      .where(
        and(eq(chatTable.frameId, frameId), eq(chatTable.projectId, projectId))
      );
    const finalResult = {
      ...frameResult[0],
      chatMessages: chatResult[0].chatMessage,
    };

    return NextResponse.json(finalResult, { status: 200 });
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const { designCode, frameId, projectId } = await req.json();

  const result = await db
    .update(framesTable)
    .set({
      designCode: designCode,
    })
    .where(
      and(
        eq(framesTable.frameId, frameId),
        eq(framesTable.projectId, projectId)
      )
    );

  return NextResponse.json({ result: "updated the design code in db" });
}
