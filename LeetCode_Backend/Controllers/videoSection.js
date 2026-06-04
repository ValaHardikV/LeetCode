import { v2 as cloudinary } from "cloudinary";
import Problem from "../Models/problemSchema.js";
import User from "../Models/userSchema.js"
import SolutionVideo from "../Models/solutionVideo.js";
import { sanitizeFilter } from "mongoose";
import "dotenv/config"


cloudinary.config(
    {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    }
);

async function generateUploadSignature(req, res) {
    try {

        const { problemId } = req.params;

        const userId = req.user._id;

        // verify problem exist
        const problem = await Problem.findById(problemId);

        if (!problem) {
            res.status(404).json(
                {
                    error: 'Problem not found'
                }
            );
        }


        // Generate unique public_id for the video
        const timestamp = Math.round(new Date().getTime() / 1000);
        const publicId = `leetcode-solutions/${problemId}/${userId}_${timestamp}`;


        // upload parameter
        const uploadParams = {
            timestamp: timestamp,
            public_id: publicId
        };

        // Generate signature
        const signature = await cloudinary.utils.api_sign_request(
            uploadParams,
            process.env.CLOUDINARY_API_SECRET
        );

        res.json(
            {
                signature,
                timestamp,
                public_id: publicId,
                api_key: process.env.CLOUDINARY_API_KEY,
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                upload_url: `https://api.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
            }
        );

    }

    catch (err) {
        console.error('Error generating upload signature:', err);

        res.status(500).json(
            {
                error: 'Failed to generate upload credentials'
            }
        );
    }
}

async function saveVideoMetadata(req, res) {
    try {

        const { problemId, cloudinaryPublicId, secureUrl, duration } = req.body;

        const userId = req.user._id;

        // verify the upload with Cloudinary
        const cloudinaryResource = await cloudinary.api.resource(
            cloudinaryPublicId,
            {
                resource_type: 'video'
            }
        );

        if (!cloudinaryResource) {
            res.status(404).json(
                {
                    error: 'Video not found on Cloudinary'
                }
            );
            return;
        }

        // Check if video already exists for this problem and user
        const existingVideo = await SolutionVideo.findOne(
            {
                problemId,
                userId,
                cloudinaryPublicId
            }
        );

        if (existingVideo) {
            res.status(409).json(
                {
                    error: 'Video already exists'
                }
            );
            return;
        }


        const thumbnailUrl = cloudinary.url(
            cloudinaryResource.public_id,
            {
                resource_type: 'image',
                transformation: [
                    { width: 400, height: 225, crop: 'fill' },
                    { quality: 'auto' },
                    { start_offset: 'auto' }
                ],
                format: 'jpg'
            }
        );

        // Create video solution record
        const videoSolution = new SolutionVideo(
            {
                problemId,
                userId,
                cloudinaryPublicId,
                secureUrl,
                duration: cloudinaryResource.duration || duration,
                thumbnailUrl
            }
        );

        await SolutionVideo.save();


        res.status(201).json(
            {
                message: 'Video solution saved successfully',
                videoSolution: {
                    id: SolutionVideo._id,
                    thumbnailUrl: SolutionVideo.thumbnailUrl,
                    duration: SolutionVideo.duration,
                    uploadedAt: SolutionVideo.createdAt
                }
            }
        );

    }

    catch (error) {
        console.error('Error saving video metadata:', error);
        res.status(500).json(
            {
                error: 'Failed to save video metadata'
            }
        );
    }
}

async function deleteVideo(req, res) {
    try {
        const { videoId } = req.params;
        const userId = req.result._id;

        const video = await SolutionVideo.findByIdAndDelete(videoId);

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        await cloudinary.uploader.destroy(
            video.cloudinaryPublicId,
            { resource_type: 'video', invalidate: true }
            // the invalidate: true option tells Cloudinary to clear any cached copies of that video from its CDN (Content Delivery Network).
        );

        res.json(
            {
                message: 'Video deleted successfully'
            }
        );

    }

    catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json(
            { error: 'Failed to delete video' }
        );
    }
}


export {generateUploadSignature, saveVideoMetadata, deleteVideo};