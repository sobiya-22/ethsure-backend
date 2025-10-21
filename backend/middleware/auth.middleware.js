import jwt from 'jsonwebtoken'
export const authenticate = (req , res , next) => {
    const { token } = req.cookies;
    if(!token){
        return res.status(401).send({message : "Please login first" , success : false});
    }
    jwt.verify(token , process.env.JWT_SECRET , (err , decode)=> {
        if(err){
            return res.status(401).send({message : "Token not valid , Please Contact Admin" , success : false});
        }
        req.user = decode;
        next()
    })
}

//




// import { verifyJWT } from "../utils/jwt.js";

// export const authMiddleware = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) return res.status(401).json({ error: "No token provided" });

//   const token = authHeader.split(" ")[1];
//   try {
//     const decoded = verifyJWT(token);
//     req.user = decoded; // { sub: ---, role }
//     next();
//   } catch (err) {
//     return res.status(403).json({ error: "Invalid token" });
//   }
// };
