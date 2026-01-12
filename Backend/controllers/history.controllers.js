import { prisma } from '../config/db.js';


// 2. Get User's History
export const getUserHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const history = await prisma.watchHistory.findMany({
            where: { userId },
            include: {
                video: { 
                    select: {
                        id: true,
                        title: true,
                        thumbnailUrl: true,
                        views: true,
                        duration: true,
                        uploader: { select: { email: true } }
                    }
                }
            },
            orderBy: { watchedAt: 'desc' }, 
            take: 20
        });

        // Clean up the response (remove the history ID, just return videos)
        const formattedHistory = history.map(item => item.video);

        res.status(200).json({ success: true, history: formattedHistory });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 3. Update Watch Progress (Heartbeat)
export const updateProgress = async (req, res) => {
    try {
        const { videoId, progress, duration } = req.body;
        const userId = req.user.id;

        // Upsert: If exists, update time. If new, create it.
        await prisma.watchHistory.upsert({
            where: {
                userId_videoId: { userId, videoId }
            },
            update: {
                progress: progress, // Update current time (e.g., 450 seconds)
                watchedAt: new Date() // Update "Last Seen" time
            },
            create: {
                userId,
                videoId,
                progress,
                duration
            }
        });

        res.status(200).json({ success: true }); // Keep it silent and fast
    } catch (error) {
        console.error("Progress Error", error);
        res.status(500).json({ message: "Error saving progress" });
    }
};