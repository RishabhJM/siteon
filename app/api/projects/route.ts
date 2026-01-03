import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { chatTable, framesTable, projectsTable, usersTable } from "@/config/schema";
import db from "@/config/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    // console.log("USER ID:", userId);

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    // console.log("PROJECTS USER",user);
    const { projectId, frameId, messages } = await req.json();

    ///create project with given data
    const projectResult = await db
      .insert(projectsTable)
      .values({ 
        projectId: projectId, 
        createdBy:user?.primaryEmailAddress?.emailAddress
        // createdBy: "test@example.com" 
    });

    //create frame

    const frameResult = await db.insert(framesTable).values({ 
        projectId: projectId, 
        frameId: frameId 
    });

    //save user message

    const chatResult = await db.insert(chatTable).values({ 
        projectId:projectId,
        frameId:frameId,
        chatMessage: messages,
        createdBy:user?.primaryEmailAddress?.emailAddress
        // createdBy: "test@example.com"
    });

    return NextResponse.json(
      { projectId, frameId, messages },
      { status: 200 }
    );
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    // console.log("USER ID:", userId);

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const userEmail = user?.primaryEmailAddress?.emailAddress;
    // console.log("PROJECTS USER",user);

    const projectsResult = await db
      .select()
      .from(projectsTable)
      //@ts-ignore
      .where(eq(projectsTable.createdBy, userEmail));
      console.log(projectsResult);

    return NextResponse.json({projectsResult}, { status: 200 });
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

