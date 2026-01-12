import { prisma } from '../config/db.js';  

export const transcodingCompleteWebhook = async (req, res) => {
    try {
        const { videoId, status, masterUrl } = req.body;

        console.log(`Received Webhook for Video: ${videoId} | Status: ${status}`);

        if (!videoId || !status) {
            return res.status(400).json({ message: "Missing fields" });
        }

        if (status === "COMPLETED") {
            await prisma.video.update({
                where: { id: videoId },
                data: {
                    status: "COMPLETED",
                    videoUrl: masterUrl, 
                }
            });
            console.log("✅ Video Status Updated to COMPLETED");
        } 
        else if (status === "FAILED") {
            await prisma.video.update({
                where: { id: videoId },
                data: { status: "FAILED" }
            });
            console.log("❌ Video Transcoding Failed");
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};