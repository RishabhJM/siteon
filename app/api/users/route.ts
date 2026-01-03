import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { usersTable } from "@/config/schema";
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
        // console.log("USER:", user);

        //if user exists?
        const userResult = await db.select().from(usersTable)
            //@ts-ignore
            .where(eq(usersTable.email, user?.primaryEmailAddress?.emailAddress))

        //if not insert new user
        if (userResult?.length == 0) {
            const data={
                email: user?.primaryEmailAddress?.emailAddress ?? 'NA',
                name: user?.fullName ?? 'NA',
                credits:2
            }
            const result = await db.insert(usersTable).values({
                ...data
            })
            return NextResponse.json({user:data});
        }
        return NextResponse.json({ user: userResult[0] })
    } catch (error) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}


export async function GET(req: NextRequest){
    const id = "user_37WFoIJnU7PsaDjPCYOUBWiA6uX";

    try{
        const client = await clerkClient();
        const user = await client.users.getUser(id);
        console.log("USER:", user);
        return NextResponse.json({user});
    }catch(ex:any){
        console.log(ex);
    }
    

}