import jwt from "jsonwebtoken";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
const privateKey = fs.readFileSync("private.pem", "utf8");
const publicKey = fs.readFileSync("public.pem", "utf8");
const ISSUER = process.env.JWT_ISSUER;
const KID = process.env.JWT_KID;

//Issue JWT
export function issueJWT(email,role) {
  return jwt.sign(
    {
      sub:email,    
      role: role,     
      iss: ISSUER,
    },
    privateKey,
    {
      algorithm: "RS256",
      keyid: KID,
      expiresIn: "1h",
    }
  );
}

export function verifyJWT(token) {
  return jwt.verify(token, publicKey, { algorithms: ["RS256"] });
}
