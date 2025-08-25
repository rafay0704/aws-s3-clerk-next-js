import { NextRequest, NextResponse } from "next/server";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

// S3 file/folder types
type S3File = {
  type: "file";
  key: string;
  lastModified?: Date;
  size?: number;
};

type S3Folder = {
  type: "folder";
  prefix: string;
  children: Array<S3File | S3Folder>;
};

type S3Item = S3File | S3Folder;

const client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
  region: process.env.AWS_REGION as string,
});

/**
 * Recursively fetch S3 folders + files
 */
async function listS3(prefix: string = ""): Promise<S3Item[]> {
  const command = new ListObjectsV2Command({
    Bucket: process.env.AWS_BUCKET_NAME as string,
    Delimiter: "/",
    Prefix: prefix,
  });

  const result = await client.send(command);

  const folders = result.CommonPrefixes?.map((cp) => cp.Prefix!) || [];

  const files: S3File[] =
    result.Contents?.filter((f) => f.Key !== prefix).map((f) => ({
      type: "file",
      key: f.Key!,
      lastModified: f.LastModified,
      size: f.Size,
    })) || [];

  // Recursively fetch subfolders
  const subFolderData: S3Folder[] = await Promise.all(
    folders.map(async (folder) => ({
      type: "folder",
      prefix: folder,
      children: await listS3(folder),
    }))
  );

  return [...subFolderData, ...files];
}

export async function GET(request: NextRequest) {
  try {
    const prefix = request.nextUrl.searchParams.get("prefix") || "";
    const data = await listS3(prefix);

    return NextResponse.json({
      status: "success",
      data,
    });
  } catch (error: unknown) {
    console.error("Error listing S3 objects:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
