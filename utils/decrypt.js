import crypto from "crypto";

export function decryptAES(encryptedHex, salt, key) {
  const encryptedBytes = Buffer.from(encryptedHex, "hex");
  const iv = Buffer.from([...Array(16).keys()]); // 0..15

  const derivedKey = crypto.pbkdf2Sync(key, salt, 65536, 32, "sha1");

  const decipher = crypto.createDecipheriv("aes-256-cbc", derivedKey, iv);
  let decrypted = decipher.update(encryptedBytes, null, "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
