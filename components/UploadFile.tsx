"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface UploadFileProps {
  folders: string[]; // list of folder paths from S3
  onUpload?: () => void;
}

export default function UploadFile({ folders, onUpload }: UploadFileProps) {
  const [file, setFile] = useState<File | null>(null);
  const [folder, setFolder] = useState<string>(""); // root by default
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    setLoading(true);

    try {
      // Construct the S3 key including folder
      const key = folder ? `${folder.replace(/\/$/, "")}/${file.name}` : file.name;

      // 1️⃣ Get presigned URL from backend
      const res = await fetch(`/api/upload-url?key=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (!data.url) throw new Error("Failed to get upload URL");

      // 2️⃣ Upload directly to S3
      await fetch(data.url, {
        method: "PUT",
        body: file,
      });

      alert("File uploaded successfully!");
      setFile(null);
      setFolder(""); // reset to root
      onUpload?.();
    } catch (err: unknown) {
      // Type-safe error handling
      const message = err instanceof Error ? err.message : "Upload failed due to unknown error";
      console.error(err);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 mb-4">
      {/* Folder selector */}
      <select
        value={folder}
        onChange={(e) => setFolder(e.target.value)}
        className="border p-2 rounded-md"
      >
        <option value="">Root</option>
        {folders.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      {/* File input */}
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="border p-2 rounded-md"
      />

      <Button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </Button>
    </div>
  );
}
