// middleware/isAuth.js
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({ message: 'Token not found. Please login.' });
        }

        const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decodeToken) {
            return res.status(401).json({ message: 'Invalid Token' });
        }

        const user = await prisma.user.findUnique({
            where: { id: decodeToken.userId }
        });

        if (!user) {
            return res.status(401).json({ message: 'User not found in database' });
        }

        req.user = user; 
        
        next();

    } catch (error) {
        return res.status(500).json({ message: 'Auth Error: ' + error.message });
    }
}

export default isAuth;