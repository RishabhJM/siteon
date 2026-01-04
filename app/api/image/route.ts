import imagekit from "../../../config/imagekit"
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    const { selectedImage } = await req.json();
    const imageRef = await imagekit.upload({
        //@ts-ignore
        file:selectedImage,
        fileName:Date.now()+Math.floor(Math.random()*100000)+".png",
        isPublished:true
    })
  return NextResponse.json({imageRef},{status:200});
}