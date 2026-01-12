
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from '../config/db.js';  


// Initialize S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const generateUploadUrl = async (req, res) => {
  try {
    const { title, extension } = req.body; 
    const uploaderId = req.user.id; // Comes from isAuth middleware

    const newVideo = await prisma.video.create({
      data: {
        title: title || "Untitled",
        uploaderId: uploaderId,
        status: "PENDING"
      }
    });

    // 2. Generate S3 Key (videos/{UUID}/source.mp4)
    const videoId = newVideo.id;
    const s3Key = `videos/${videoId}/source.${extension}`;

    // 3. Generate URL
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      ContentType: `video/${extension}`,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    res.json({ success: true, uploadUrl, videoId });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload Error" });
  }
};


// 2. Update Video Details (After upload or anytime)
export const createVideoMetadata = async (req, res) => {
    try {
        const { videoId, title, description, thumbnailUrl } = req.body;

        if (!videoId) {
            return res.status(400).json({ message: "Video ID is required" });
        }

        const updatedVideo = await prisma.video.update({
            where: { id: videoId },
            data: {
                title: title,
                description: description,
                thumbnailUrl: thumbnailUrl,
                // We do NOT update 'status' here. The Cloud Webhook does that.
            }
        });

        res.json({ success: true, message: "Video updated successfully", video: updatedVideo });

    } catch (error) {
        console.error("Metadata Update Error:", error);
        res.status(500).json({ message: "Failed to update video details" });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        // Run all queries in parallel
        const [totalUsers, totalVideos, totalUniqueViews, mostWatched] = await Promise.all([
            // 1. Count Total Users
            prisma.user.count(),

            // 2. Count Total Videos (Only COMPLETED ones)
            prisma.video.count({
                where: { status: 'COMPLETED' }
            }),

            // 3. Count Unique Views (Using your new View table)
            prisma.view.count(),

            // 4. Get Top Video (Sort by views count on the video itself)
            prisma.video.findFirst({
                where: { status: 'COMPLETED' },
                orderBy: { views: 'desc' },
                select: {
                    title: true,
                    views: true,
                    thumbnailUrl: true,
                    uploader: { select: { email: true } }
                }
            })
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalVideos,
                totalViews: totalUniqueViews, 
                mostWatched
            }
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};