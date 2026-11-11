/**
 * Apply Cloudinary's automatic format/quality and a responsive width limit.
 * Non-Cloudinary URLs and URLs that already contain a transformation are left alone.
 */
export const optimizedImageUrl = (source, width = 1200) => {
  if (typeof source !== "string" || !source.includes("res.cloudinary.com/") || !source.includes("/image/upload/")) {
    return source || "";
  }
  const safeWidth = Math.max(160, Math.min(2400, Math.round(Number(width) || 1200)));
  const marker = "/image/upload/";
  const index = source.indexOf(marker);
  const remainder = source.slice(index + marker.length);
  if (/^(?:f_auto|q_auto|w_\d+|c_[a-z]+)(?:,|\/)/.test(remainder)) return source;
  return `${source.slice(0, index + marker.length)}f_auto,q_auto,w_${safeWidth},c_limit/${remainder}`;
};
