import { UploadZone } from "../components/Upload/UploadZone";

export default function Upload() {
  return (
    <section className="space-y-5" aria-labelledby="upload-heading">
      <header>
        <h1 id="upload-heading" className="text-3xl font-bold leading-tight text-ink">
          Upload
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-soft">
          Add a photo, describe it clearly, and choose who can see it before it joins your gallery.
        </p>
      </header>
      <UploadZone />
    </section>
  );
}
