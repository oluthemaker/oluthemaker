import crypto from "crypto";

export const hashAbandonedCartToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const safeTokenEqual = (left, right) => {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b);
};

const getEncryptionKey = () => {
  const key = Buffer.from(process.env.ABANDONED_CART_TOKEN_ENCRYPTION_KEY || "", "base64");
  if (key.length !== 32) throw Object.assign(new Error("Abandoned cart encryption is not configured."), { statusCode: 503 });
  return key;
};

export const encryptAbandonedCartToken = (token) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return `${iv.toString("base64")}:${cipher.getAuthTag().toString("base64")}:${encrypted.toString("base64")}`;
};

export const decryptAbandonedCartToken = (ciphertext) => {
  if (!ciphertext) return null;
  try {
    const [ivText, tagText, encryptedText] = ciphertext.split(":");
    const decipher = crypto.createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(ivText, "base64"));
    decipher.setAuthTag(Buffer.from(tagText, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(encryptedText, "base64")), decipher.final()]).toString("utf8");
  } catch { return null; }
};
