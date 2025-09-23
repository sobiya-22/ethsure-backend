import fs from "fs/promises";
import { importSPKI, exportJWK } from "jose";
import crypto from "crypto";

const pem = await fs.readFile("public.pem", "utf8");

const cryptoKey = await importSPKI(pem, "RS256");

const jwk = await exportJWK(cryptoKey);

//   NOTE: (here kid is the hash genrated of the json itself)
jwk.use = "sig";              // mark it for signature
jwk.alg = "RS256";            // specify algorithm
jwk.kid = crypto              // generate a stable kid
  .createHash("sha256")
  .update(JSON.stringify(jwk))
  .digest("base64url");       

const jwks = { keys: [jwk] };

await fs.writeFile("jwks.json", JSON.stringify(jwks, null, 2));
console.log("JWKS generated:", jwks);
