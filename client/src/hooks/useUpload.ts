import { useState } from "react";

export interface UploadItem {
  file: File;
  progress: number;
  status: "queued" | "uploading" | "complete" | "error";
}

export function useUploadQueue() {
  const [items, setItems] = useState<UploadItem[]>([]);

  function addFiles(files: FileList | File[]) {
    const nextItems = Array.from(files).map((file) => ({
      file,
      progress: 0,
      status: "queued" as const
    }));

    setItems((current) => [...current, ...nextItems]);
  }

  function clearQueue() {
    setItems([]);
  }

  return {
    items,
    addFiles,
    clearQueue
  };
}
