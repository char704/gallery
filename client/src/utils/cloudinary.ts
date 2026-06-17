export function buildCloudinaryThumbnail(url: string, width = 600): string {
  if (!url.includes("/upload/")) {
    return url;
  }

  return url.replace("/upload/", `/upload/c_fill,w_${width},q_auto,f_auto/`);
}
