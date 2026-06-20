interface CloudinaryTransformation {
  width?: number;
  crop?: string;
  quality?: string;
  fetch_format?: string;
}

interface CloudinaryUrlOptions {
  secure?: boolean;
  transformation?: CloudinaryTransformation[];
}

function encodePublicId(publicId: string): string {
  return publicId
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function toTransformationString(transformation: CloudinaryTransformation): string {
  return [
    transformation.width ? `w_${transformation.width}` : null,
    transformation.crop ? `c_${transformation.crop}` : null,
    transformation.quality ? `q_${transformation.quality}` : null,
    transformation.fetch_format ? `f_${transformation.fetch_format}` : null
  ]
    .filter(Boolean)
    .join(",");
}

export function sanitizeCloudinaryCloudName(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  const cloudName = value
    .trim()
    .replace(/cloud\s*name/gi, "")
    .replace(/\s+/g, "");

  return /^[a-zA-Z0-9_-]+$/.test(cloudName) ? cloudName : "";
}

export const cloudinary = {
  url(publicId: string, options: CloudinaryUrlOptions = {}): string {
    const cloudName = sanitizeCloudinaryCloudName(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    if (!cloudName || !publicId) {
      return "";
    }

    const protocol = options.secure === false ? "http" : "https";
    const transformations = options.transformation?.map(toTransformationString).filter(Boolean).join("/") ?? "";
    const transformationPath = transformations ? `${transformations}/` : "";

    return `${protocol}://res.cloudinary.com/${cloudName}/image/upload/${transformationPath}${encodePublicId(publicId)}`;
  }
};

export function buildCloudinaryThumbnail(url: string, width = 600): string {
  if (!url.includes("/upload/")) {
    return url;
  }

  return url.replace("/upload/", `/upload/c_fill,w_${width},q_auto,f_auto/`);
}
