import { prisma } from '../config/db.js';

// 1. Get All Videos
// controllers/video.controllers.js

export const getAllVideos = async (req, res) => {
    try {
        // 1. Extract category from the URL query (e.g., ?category=Action)
        const { category } = req.query;

        // 2. Build the query object
        const videos = await prisma.video.findMany({
            where: {
                status: 'COMPLETED',
                // This logic says: "If a category exists in the URL, filter by it. 
                // If not, just show all completed videos."
                ...(category ? { category: category } : {})
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

        // 3. Return consistent JSON
        res.status(200).json({ 
            success: true, 
            count: videos.length, 
            videos 
        });

    } catch (error) {
        console.error("GET_ALL_VIDEOS_ERROR:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server Error", 
            error: error.message 
        });
    }
};

// 2. Get Single Video (Watch Screen)
export const getVideoById = async (req, res) => {
  try {
    const video = await prisma.video.findUnique({ 
        where: { id: req.params.id },
        include: {
            uploader: {
                select: { email: true } // Crucial: This fixes the frontend crash
            }
        }
    });

    if (!video) {
        return res.status(404).json({ message: "Video not found" });
    }
    
    // Authorization logic: Block if private AND user is not the owner
    if (video.isPrivate && video.userId !== req.user.id) {
      console.log(`Blocked: User ${req.user.email} tried to watch private video ${video.title}`);
      return res.status(403).json({ message: "You do not have permission to watch this" });
    }
    
    res.json({ success: true, video }); // Added success: true for consistency
  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
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
// export const getFeaturedVideo = async (req, res) => {
//     try {
//         // Get total count of completed videos
//         const count = await prisma.video.count({ where: { status: 'COMPLETED' } });
        
//         if (count === 0) return res.status(404).json({ message: "No videos available" });

//         // Get a random number
//         const randomSkip = Math.floor(Math.random() * count);

//         // Fetch 1 random video
//         const video = await prisma.video.findFirst({
//             where: { status: 'COMPLETED' },
//             skip: randomSkip,
//             include: { uploader: { select: { email: true } } }
//         });

//         res.status(200).json({ success: true, video });
//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error: error.message });
//     }
// };
export const getFeaturedVideo = async (req, res) => {
  try {
    const video = await prisma.video.findFirst({
      where: { status: 'COMPLETED' }, // Ensure we only show finished videos
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: { select: { email: true } }
      }
    });

    if (!video) {
        return res.status(404).json({ message: "No videos found" });
    }

    // Return in a consistent format { success: true, video: ... }
    res.json({ success: true, video }); 

  } catch (error) {
    console.error("🔥 CRITICAL ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


// video.controller.js

export const incrementView = async (req, res) => {
  try {
    const { id: videoId } = req.params;
    const userId = req.user?.id; // Use optional chaining to prevent crash

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Use a try-catch specifically for the creation to handle race conditions
    try {
      await prisma.$transaction([
        // This will throw an error if the unique constraint (userId_videoId) is violated
        prisma.view.create({
          data: {
            userId: userId,
            videoId: videoId,
          },
        }),
        prisma.video.update({
          where: { id: videoId },
          data: { views: { increment: 1 } },
        }),
      ]);
      return res.status(200).json({ message: "Unique view added" });
    } catch (prismaError) {
      // P2002 is Prisma's code for Unique Constraint violation
      if (prismaError.code === 'P2002') {
        return res.status(200).json({ message: "View already recorded" });
      }
      throw prismaError; // Re-throw if it's a different error
    }

  } catch (error) {
    console.error("View Logic Error Details:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};