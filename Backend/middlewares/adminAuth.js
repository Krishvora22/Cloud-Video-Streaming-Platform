// middleware/adminAuth.js

const adminAuth = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: "Authentication failed. No user found." 
            });
        }

        // 2. CHECK ROLE
        // Assuming your Prisma Enum is 'ADMIN' (uppercase) or string 'admin'
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ 
                success: false, 
                message: "Access Denied: Admins Only" 
            });
        }

        next();

    } catch (error) {
        return res.status(500).json({ message: 'Admin Auth Error' });
    }
}

export default adminAuth;