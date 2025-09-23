import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import fs from "fs";

const privateKey = fs.readFileSync("private.pem", "utf8");
// const client = jwksClient({
//   jwksUri: `${process.env.BACKEND_URL}/.well-known/jwks.json`,
// });

// function getKey(header, callback) {
//   client.getSigningKey(header.kid, function (err, key) {
//     const signingKey = key.getPublicKey();
//     callback(null, signingKey);
//   });
// }

export const verifyJWT = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).json({ error: "Token missing" });

  try {
    const decoded = jwt.verify(token, privateKey, { algorithms: ["RS256"] });
    req.user = decoded; // { sub: walletAddress, role }
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

