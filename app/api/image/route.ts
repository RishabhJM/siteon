import imagekit from "../../../config/imagekit"
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
  try {
    const { selectedImage } = await req.json();
    if (!selectedImage) {
      console.error("[api/image POST] Missing selected image");
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }
    const imageRef = await imagekit.upload({
      //@ts-ignore
      file:selectedImage,
      fileName:Date.now()+Math.floor(Math.random()*100000)+".png",
      isPublished:true
    });
    return NextResponse.json({imageRef},{status:200});
  } catch (error) {
    console.error("[api/image POST] Image upload failed:", error);
    return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
  }
}
