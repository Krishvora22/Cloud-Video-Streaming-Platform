import { prisma } from '../config/db.js';

// Toggle "My List" (Add/Remove)
export const toggleWatchList = async (req, res) => {
    try {
        const { videoId } = req.body; 
        const userId = req.user.id;

        const existingItem = await prisma.watchList.findUnique({
            where: {
                userId_videoId: { userId, videoId }
            }
        });

        if (existingItem) {
            await prisma.watchList.delete({
                where: { userId_videoId: { userId, videoId } }
            });
            return res.status(200).json({ success: true, message: "Removed from My List" });
        } else {
            await prisma.watchList.create({
                data: { userId, videoId }
            });
            return res.status(200).json({ success: true, message: "Added to My List" });
        }

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get User's "My List"
export const getMyList = async (req, res) => {
    try {
        const userId = req.user.id;

        const list = await prisma.watchList.findMany({
            where: { userId },
            include: {
                video: {
                    select: {
                        id: true,
                        title: true,
                        thumbnailUrl: true,
                        views: true
                    }
                }
            },
            orderBy: { addedAt: 'desc' }
        });

        const formattedList = list.map(item => item.video);

        res.status(200).json({ success: true, videos: formattedList });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Add this new function to your controller file:
export const checkWatchlistStatus = async (req, res) => {
    try {
        const { videoId } = req.params; 
        const userId = req.user.id;

        const existingItem = await prisma.watchList.findUnique({
            where: {
                userId_videoId: { userId, videoId }
            }
        });

        // Return true if it exists, false if it doesn't
        return res.status(200).json({ isInWatchlist: !!existingItem });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};