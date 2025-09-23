import fs from "fs/promises";
import { importSPKI, exportJWK } from "jose";

const pem = await fs.readFile("public.pem", "utf8");

// Import the PEM as a WebCrypto CryptoKey
const cryptoKey = await importSPKI(pem, "RS256");

// Export the CryptoKey as JWK
const jwk = await exportJWK(cryptoKey);

// Wrap it in a JWKS structure
const jwks = { keys: [jwk] };

// Save to file
await fs.writeFile("jwks.json", JSON.stringify(jwks, null, 2));
console.log("JWKS generated:", jwks);