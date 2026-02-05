import crypto from "crypto";

const SECRET = process.env.FIELD_ENCRYPTION_KEY as string;
if (!SECRET) throw new Error("FIELD_ENCRYPTION_KEY missing");

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;

function getKey() {
  return crypto.createHash("sha256").update(SECRET).digest();
}

export function encryptField(value: string | null) {
  if (!value) return null;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptField(value: string | null) {
  if (!value) return null;

  const data = Buffer.from(value, "base64");

  const iv = data.subarray(0, IV_LENGTH);
  const tag = data.subarray(IV_LENGTH, IV_LENGTH + 16);
  const text = data.subarray(IV_LENGTH + 16);

  const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(text), decipher.final()]);

  return decrypted.toString("utf8");
}
