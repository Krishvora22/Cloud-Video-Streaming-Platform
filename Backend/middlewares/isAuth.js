import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const isAuth = async (req, res, next) => {
    try {
        // 1. Extract token from Header (Bearer <token>) or Cookies
        let token = req.cookies?.token;

        if (!token && req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Token not found. Please login.' });
        }

        // 2. Verify Token
        const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decodeToken) {
            return res.status(401).json({ message: 'Invalid Token' });
        }

        // 3. Find User
        const user = await prisma.user.findUnique({
            where: { id: decodeToken.userId }
        });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user; 
        next();

    } catch (error) {
        console.error("Auth Error:", error.message);
        return res.status(403).json({ message: 'Forbidden: ' + error.message });
    }
}

export default isAuth;