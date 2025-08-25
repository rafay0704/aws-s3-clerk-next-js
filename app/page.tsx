"use client";

import React, { useEffect, useState } from "react";
import { ChevronRight, ChevronDown, Folder, File, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UploadFile from "@/components/UploadFile";

// Define S3 object types
type S3File = {
  type: "file";
  key: string;
  size: number;
  lastModified?: Date;
};

type S3Folder = {
  type: "folder";
  prefix: string;
  children: Array<S3File | S3Folder>;
};

type S3Node = S3File | S3Folder;

type TreeNodeProps = {
  node: S3Node;
  onFileClick: (file: S3File) => void;
};

const TreeNode = ({ node, onFileClick }: TreeNodeProps) => {
  const [open, setOpen] = useState(false);

  if (!node) return null;

  if (node.type === "folder") {
    return (
      <div className="ml-2">
        <div
          className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition"
          onClick={() => setOpen(!open)}
        >
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <Folder className="text-yellow-500" size={18} />
          <span className="font-medium">
            {node.prefix.replace(/\/$/, "").split("/").pop()}
          </span>
        </div>

        {open && node.children.length > 0 && (
          <div className="ml-6 border-l border-gray-200 pl-3 space-y-1">
            {node.children.map((child, i) => (
              <TreeNode key={i} node={child} onFileClick={onFileClick} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (node.type === "file") {
    return (
      <div
        className="flex items-center gap-2 p-2 ml-7 hover:bg-gray-50 rounded-lg cursor-pointer transition"
        onClick={() => onFileClick(node)}
      >
        <File className="text-blue-500" size={16} />
        <span className="truncate">{node.key.split("/").pop()}</span>
        <span className="ml-auto text-xs text-gray-400">
          {(node.size / 1024).toFixed(1)} KB
        </span>
      </div>
    );
  }

  return null;
};

export default function Home() {
  const [data, setData] = useState<S3Node[]>([]);
  const [selectedFile, setSelectedFile] = useState<S3File | null>(null);
  const [signedUrl, setSignedUrl] = useState<string>("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/objects");
      const json = await res.json();
      setData(Array.isArray(json.data) ? json.data : []);
    } catch (error) {
      console.error(error);
      setData([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileClick = async (file: S3File) => {
    setSelectedFile(file);
    try {
      const res = await fetch(`/api/signed-url?key=${encodeURIComponent(file.key)}`);
      const json = await res.json();
      setSignedUrl(json.url || "");
    } catch (err) {
      console.error("Failed to fetch signed URL:", err);
      setSignedUrl("");
    }
  };

  const closePreview = () => {
    setSelectedFile(null);
    setSignedUrl("");
  };

  return (
    <div>

      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <Card className="p-6 shadow-lg rounded-xl border border-gray-100">
          <h1 className="text-2xl font-bold mb-4">📂 File Explorer</h1>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {data.length > 0 ? (
              data.map((node, i) => (
                <TreeNode key={i} node={node} onFileClick={handleFileClick} />
              ))
            ) : (
              <p className="text-gray-500 text-sm">No files or folders found.</p>
            )}
          </div>
        </Card>

        <UploadFile
          folders={data.filter((n) => n.type === "folder").map((f) => f.prefix.replace(/\/$/, ""))}
          onUpload={fetchData}
        />

        {selectedFile && (
          <Dialog open={!!selectedFile} onOpenChange={closePreview}>
            <DialogContent className="max-w-3xl p-6 rounded-xl">
              <DialogHeader className="flex justify-between items-center mb-4">
                <DialogTitle className="text-lg font-semibold">
                  {selectedFile.key.split("/").pop()}
                </DialogTitle>
                <div className="flex gap-2">
                  {signedUrl && (
                    <a href={signedUrl} download>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Download size={16} /> Download
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      if (!selectedFile.key) return;
                      if (!confirm("Are you sure you want to delete this file?")) return;

                      try {
                        const res = await fetch(`/api/delete-file?key=${encodeURIComponent(selectedFile.key)}`, {
                          method: "DELETE",
                        });
                        const json = await res.json();

                        if (json.status === "success") {
                          alert("File deleted successfully!");
                          setSelectedFile(null);
                          setSignedUrl("");
                          fetchData();
                        } else {
                          alert("Failed to delete file: " + json.message);
                        }
                      } catch (err) {
                        console.error(err);
                        alert("Delete failed");
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </DialogHeader>

              <div className="mt-4">
                {selectedFile && signedUrl ? (
                  selectedFile.key.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <img
                      src={signedUrl}
                      alt={selectedFile.key}
                      className="max-h-[500px] mx-auto rounded-lg shadow-lg"
                    />
                  ) : selectedFile.key.match(/\.(txt|md)$/i) ? (
                    <iframe src={signedUrl} className="w-full h-[500px] rounded-lg border" />
                  ) : (
                    <p className="text-gray-600 text-center">
                      No preview available for this file type.
                    </p>
                  )
                ) : (
                  <p className="text-gray-500 text-center">Loading preview...</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
