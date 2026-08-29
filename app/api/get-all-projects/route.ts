import db from "@/config/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";


import { desc, eq, inArray } from "drizzle-orm";
import { chatTable, framesTable, projectsTable } from "@/config/schema";
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user?.primaryEmailAddress?.emailAddress) {
      console.error("[api/get-all-projects GET] Missing authenticated user email");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Get the project

    //@ts-ignore
    const projects = await db.select().from(projectsTable).where(eq(projectsTable.createdBy, user.primaryEmailAddress.emailAddress))
    .orderBy(desc(projectsTable.createdAt));

    let results: {
        projectId: string;
        frameId: string;
        chats: { id: number; chatMessage: any; createdBy: string; createdOn: Date }[];
    }[] = [];

    for (const project of projects) {
        const frames = await db
            .select({ frameId: framesTable.frameId })
            .from(framesTable)
            //@ts-ignore
            .where(eq(framesTable.projectId, project.projectId));

        // Fetch chats for all frames in this project in one query
        const frameIds = frames.map((f: any) => f.frameId);
        let chats: any[] = [];
        if (frameIds.length > 0) {
            chats = await db
                .select()
                .from(chatTable)
                .where(inArray(chatTable.frameId, frameIds));
        }

        // Combine: attach chats to each frame
        for (const frame of frames) {
            results.push({
                projectId: project.projectId ?? '',
                frameId: frame.frameId ?? '',
                chats: chats.filter((c) => c.frameId === frame.frameId),
            });
        }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("[api/get-all-projects GET] Failed to load projects:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
