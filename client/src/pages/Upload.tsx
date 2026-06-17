import { UploadZone } from "../components/Upload/UploadZone";

export default function Upload() {
  return (
    <section>
      <h1 className="text-2xl font-semibold text-ink">Upload</h1>
      <div className="mt-5">
        <UploadZone />
      </div>
    </section>
  );
}
