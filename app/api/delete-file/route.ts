import { NextRequest, NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Missing file key" }, { status: 400 });
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    });

    await client.send(command);

    return NextResponse.json({ status: "success", message: "File deleted" });
  } catch (error: unknown) {
    console.error("Error deleting file:", error);

    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
