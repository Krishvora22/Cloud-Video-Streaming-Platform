import { prisma } from '../config/db.js'; // Use Prisma

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id; // Corrected to match your isAuth middleware

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Remove password before sending
        const { password, ...userData } = user;
        
        res.status(200).json({ success: true, user: userData });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { email } = req.body; // Add 'password' here if you want to handle password changes

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { email }, // Update fields
            select: { id: true, email: true } // Don't return the password
        });

        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Update failed", error: error.message });
    }
};