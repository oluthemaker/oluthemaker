import test from "node:test";
import assert from "node:assert/strict";
import { hashAbandonedCartToken, safeTokenEqual, encryptAbandonedCartToken, decryptAbandonedCartToken } from "../utils/abandonedCartTokens.js";

const originalKey = process.env.ABANDONED_CART_TOKEN_ENCRYPTION_KEY;
test.after(() => {
  if (originalKey === undefined) delete process.env.ABANDONED_CART_TOKEN_ENCRYPTION_KEY;
  else process.env.ABANDONED_CART_TOKEN_ENCRYPTION_KEY = originalKey;
});

test("recovery tokens are hashed consistently and compared safely", () => {
  const token = "a".repeat(64);
  assert.equal(hashAbandonedCartToken(token), hashAbandonedCartToken(token));
  assert.equal(safeTokenEqual(hashAbandonedCartToken(token), hashAbandonedCartToken(token)), true);
  assert.equal(safeTokenEqual(hashAbandonedCartToken(token), hashAbandonedCartToken("b".repeat(64))), false);
  assert.equal(safeTokenEqual("short", "different"), false);
});

test("recovery token can be encrypted and decrypted with a 32-byte key", () => {
  process.env.ABANDONED_CART_TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
  const token = "c".repeat(64);
  const ciphertext = encryptAbandonedCartToken(token);
  assert.notEqual(ciphertext, token);
  assert.equal(decryptAbandonedCartToken(ciphertext), token);
  assert.equal(decryptAbandonedCartToken(`${ciphertext.slice(0, -4)}xxxx`), null);
});

test("recovery token encryption fails closed when the key is missing or invalid", () => {
  delete process.env.ABANDONED_CART_TOKEN_ENCRYPTION_KEY;
  assert.throws(() => encryptAbandonedCartToken("token"), { statusCode: 503 });
  process.env.ABANDONED_CART_TOKEN_ENCRYPTION_KEY = "not-a-32-byte-key";
  assert.equal(decryptAbandonedCartToken("bad:data:blob"), null);
});
