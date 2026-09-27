import { PRODUCT, json, corsPreflight, getPublicKeyPem } from './_lib.mjs';

export const config = { path: '/api/public-key', method: ['GET', 'OPTIONS'] };

// The Ed25519 public key licenses and receipts are signed with. Menu OS pins it on first
// contact (or from its own config) to check tokens and cached receipts while offline.
export default async (req) => {
  if (req.method === 'OPTIONS') return corsPreflight();
  return json({ product: PRODUCT, alg: 'Ed25519', public_key: await getPublicKeyPem() });
};
