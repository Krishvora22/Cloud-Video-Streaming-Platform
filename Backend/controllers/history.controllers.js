import { prisma } from '../config/db.js';

// Fixes the 404 error on WatchPage line 57
export const getVideoHistory = async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.user.id;

        const history = await prisma.watchHistory.findUnique({
            where: {
                userId_videoId: { userId, videoId }
            }
        });

        res.status(200).json({ success: true, progress: history ? history.progress : 0 });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Heartbeat (Stores progress)
export const updateProgress = async (req, res) => {
    try {
        const { videoId, progress, duration } = req.body;
        const userId = req.user.id;

        await prisma.watchHistory.upsert({
            where: { userId_videoId: { userId, videoId } },
            update: { progress, watchedAt: new Date() },
            create: { userId, videoId, progress, duration }
        });

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getUserHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const history = await prisma.watchHistory.findMany({
            where: { 
                userId: userId,
                // Optional: Only show videos where they've watched at least 1 second
                progress: { gt: 0 } 
            },
            include: {
                video: {
                    select: {
                        id: true,
                        title: true,
                        thumbnailUrl: true,
                        views: true,
                        duration: true,
                        category: true,
                        uploader: {
                            select: { email: true }
                        }
                    }
                }
            },
            orderBy: {
                watchedAt: 'desc' // Most recently watched first
            },
            take: 20 // Limit to last 20 videos for performance
        });

        // Format the response to return the video objects directly
        const formattedHistory = history.map(item => ({
            ...item.video,
            watchedProgress: item.progress // Pass the progress so UI can show a progress bar
        }));

        res.status(200).json({ 
            success: true, 
            history: formattedHistory 
        });
    } catch (error) {
        console.error("Fetch History Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};