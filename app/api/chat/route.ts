import db from "@/config/db";
import { chatTable } from "@/config/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";


export async function PUT(req:NextRequest){
  try {
    const {messages,frameId} = await req.json();

    const result = await db.update(chatTable).set({
        chatMessage:messages
    }).where(
        eq(chatTable.frameId,frameId)
      );

    return NextResponse.json({result:'updated'})
  } catch (error) {
    console.error("[api/chat PUT] Failed to save chat messages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
