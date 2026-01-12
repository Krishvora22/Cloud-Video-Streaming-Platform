import { prisma } from '../config/db.js';

// 1. Get All Videos
// controllers/video.controllers.js

export const getAllVideos = async (req, res) => {
    try {
        const videos = await prisma.video.findMany({
            where: {
                status: 'COMPLETED'
            },
            include: {
                uploader: { 
                    select: { 
                        id: true,
                        email: true 
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        res.status(200).json({ success: true, count: videos.length, videos });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 2. Get Single Video (Watch Screen)
export const getVideoById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const video = await prisma.video.findUnique({
            where: { id: id },
            include: { uploader: { select: { email: true } } }
        });

        if (!video) return res.status(404).json({ message: "Video not found" });

        // Check if user has watched this before
        const history = await prisma.watchHistory.findUnique({
            where: {
                userId_videoId: { userId, videoId: id }
            }
        });

        // Add 'progress' to the response
        const videoWithProgress = {
            ...video,
            lastPlayedAt: history ? history.progress : 0 // Start at 0 if no history
        };


        res.status(200).json({ success: true, video: videoWithProgress });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
// 3. Get Related Videos (Smart Category Logic)
export const getRelatedVideos = async (req, res) => {
    try {
        const { id } = req.params;

        const currentVideo = await prisma.video.findUnique({
            where: { id },
            select: { category: true }
        });

        if (!currentVideo) {
            return res.status(404).json({ message: "Video not found" });
        }

        const category = currentVideo.category || "General";

        let relatedVideos = await prisma.video.findMany({
            where: {
                status: 'COMPLETED',
                category: category, 
                id: { not: id } 
            },
            include: {
                uploader: { select: { email: true } }
            },
            take: 6
        });

        // 3. FALLBACK: If we found less than 6 videos, fetch random latest ones to fill the gap
        if (relatedVideos.length < 6) {
            const moreVideos = await prisma.video.findMany({
                where: {
                    status: 'COMPLETED',
                    id: { not: id },
                    // Ensure we don't pick videos we already have
                    NOT: {
                        id: { in: relatedVideos.map(v => v.id) }
                    }
                },
                include: {
                    uploader: { select: { email: true } }
                },
                orderBy: { createdAt: 'desc' }, // Newest first
                take: 6 - relatedVideos.length
            });

            relatedVideos = [...relatedVideos, ...moreVideos];
        }

        res.status(200).json({ success: true, videos: relatedVideos });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 4. Update Video Details (Title, Description, Category, Thumbnail)
export const updateVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, thumbnailUrl } = req.body;

        const updatedVideo = await prisma.video.update({
            where: { id: id },
            data: {
                title: title,             
                description: description,
                category: category,
                thumbnailUrl: thumbnailUrl
            }
        });

        res.status(200).json({ success: true, video: updatedVideo });

    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Video not found" });
        }
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 5. Search Videos
export const searchVideos = async (req, res) => {
    try {
        const { query } = req.query; 

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const videos = await prisma.video.findMany({
            where: {
                status: 'COMPLETED', 
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { category: { contains: query, mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                title: true,
                thumbnailUrl: true,
                views: true,
                uploader: { select: { email: true } }
            },
            take: 10
        });

        res.status(200).json({ success: true, videos });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 6. Delete Video
export const deleteVideo = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await prisma.video.findUnique({
            where: { id }
        });

        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }

        await prisma.video.delete({
            where: { id }
        });

        res.status(200).json({ success: true, message: "Video deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 7. Get All Unique Categories (For Navbar)
export const getAllCategories = async (req, res) => {
    try {

        const categories = await prisma.video.findMany({
            where: { status: 'COMPLETED' },
            select: { category: true },
            distinct: ['category'] // Only return unique values (e.g. "Action", "Drama")
        });

        // Convert [{category: "Action"}, {category: "Drama"}] -> ["Action", "Drama"]
        const categoryList = categories.map(item => item.category).filter(Boolean);

        res.status(200).json({ success: true, categories: categoryList });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 8. Get Random / Featured Video (For Hero Section)
export const getFeaturedVideo = async (req, res) => {
    try {
        // Get total count of completed videos
        const count = await prisma.video.count({ where: { status: 'COMPLETED' } });
        
        if (count === 0) return res.status(404).json({ message: "No videos available" });

        // Get a random number
        const randomSkip = Math.floor(Math.random() * count);

        // Fetch 1 random video
        const video = await prisma.video.findFirst({
            where: { status: 'COMPLETED' },
            skip: randomSkip,
            include: { uploader: { select: { email: true } } }
        });

        res.status(200).json({ success: true, video });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};