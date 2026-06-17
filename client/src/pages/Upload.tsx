import { UploadProgress } from "../components/Upload/UploadProgress";
import { UploadZone } from "../components/Upload/UploadZone";
import { useUploadQueue } from "../hooks/useUpload";

export default function Upload() {
  const uploadQueue = useUploadQueue();

  return (
    <section>
      <h1 className="text-2xl font-semibold text-ink">Upload</h1>
      <div className="mt-5">
        <UploadZone onFilesSelected={uploadQueue.addFiles} />
        <UploadProgress items={uploadQueue.items} />
      </div>
    </section>
  );
}
