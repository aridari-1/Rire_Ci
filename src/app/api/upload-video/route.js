import { NextResponse } from "next/server";

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const title = formData.get("title");

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const libraryId = process.env.BUNNY_LIBRARY_ID;
  const apiKey = process.env.BUNNY_API_KEY;

  // Step 1 — Create video object in Bunny
  const createRes = await fetch(
    `https://video.bunnycdn.com/library/${libraryId}/videos`,
    {
      method: "POST",
      headers: {
        AccessKey: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    }
  );

  const videoObj = await createRes.json();
  const videoId = videoObj.guid;

  // Step 2 — Upload the actual file
  const fileBuffer = await file.arrayBuffer();

  await fetch(
    `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
    {
      method: "PUT",
      headers: {
        AccessKey: apiKey,
        "Content-Type": "application/octet-stream",
      },
      body: fileBuffer,
    }
  );

  return NextResponse.json({ videoId });
}