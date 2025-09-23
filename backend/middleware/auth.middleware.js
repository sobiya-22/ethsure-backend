// import jwt from "jsonwebtoken";
// import jwksClient from "jwks-rsa";
// import fs from "fs";

// const privateKey = fs.readFileSync("private.pem", "utf8");
// const client = jwksClient({
//   jwksUri: `${process.env.BACKEND_URL}/.well-known/jwks.json`,
// });

// function getKey(header, callback) {
//   client.getSigningKey(header.kid, function (err, key) {
//     const signingKey = key.getPublicKey();
//     callback(null, signingKey);
//   });
// }

import { verifyJWT } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyJWT(token);
    req.user = decoded; // { sub: ---, role }
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};
