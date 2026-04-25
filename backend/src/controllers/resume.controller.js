import asyncHandler from 'express-async-handler';
import mammoth from 'mammoth';
import https from 'https';
import http from 'http';
import Resume from '../models/Resume.model.js';
import { cloudinary } from '../config/cloudinary.js';

import pdfParse from 'pdf-parse-fork';

// Helper: fetch file as buffer from a URL (Cloudinary)
const fetchBuffer = (url) => {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        }).on('error', reject);
    });
};

// Helper: extract text from buffer based on file type
const extractTextFromBuffer = async (buffer, fileType) => {
    try {
        if (fileType === 'pdf') {
            const data = await pdfParse(buffer);
            return data.text || '';
        } else if (fileType === 'doc' || fileType === 'docx') {
            const result = await mammoth.extractRawText({ buffer });
            return result.value || '';
        }
        return '';
    } catch (err) {
        console.error('Text extraction error:', err.message);
        return '';
    }
};

// @desc    Upload resume
// @route   POST /api/resumes/upload
// @access  Private
export const uploadResume = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Please upload a file');
    }

    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    const buffer = req.file.buffer; // direct buffer from memory storage

    // Extract text first before uploading
    let rawText = '';
    try {
        rawText = await extractTextFromBuffer(buffer, fileExtension);
        console.log('Extracted text length:', rawText.length);
    } catch (err) {
        console.error('Text extraction error:', err.message);
    }

    // Now upload buffer to Cloudinary
    let fileUrl = '';
    let cloudinaryId = '';
    try {
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'resume-analyzer/resumes',
                    resource_type: 'raw',
                    public_id: `${Date.now()}-${req.file.originalname}`,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(buffer);
        });

        fileUrl = uploadResult.secure_url;
        cloudinaryId = uploadResult.public_id;
        console.log('Uploaded to Cloudinary:', fileUrl);
    } catch (err) {
        console.error('Cloudinary upload error:', err.message);
        res.status(500);
        throw new Error('Failed to upload file to Cloudinary');
    }

    const resume = await Resume.create({
        user: req.user._id,
        fileName: req.file.originalname,
        fileUrl,
        cloudinaryId,
        fileType: fileExtension,
        rawText,
    });

    res.status(201).json({ success: true, data: resume });
});

// @desc    Get all user resumes
// @route   GET /api/resumes
// @access  Private
export const getResumes = asyncHandler(async (req, res) => {
    const resumes = await Resume.find({ user: req.user._id })
        .populate('analysisId', 'overallScore atsScore status createdAt')
        .sort({ createdAt: -1 });

    res.json({ success: true, count: resumes.length, data: resumes });
});

// @desc    Get single resume
// @route   GET /api/resumes/:id
// @access  Private
export const getResume = asyncHandler(async (req, res) => {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id })
        .populate('analysisId');

    if (!resume) {
        res.status(404);
        throw new Error('Resume not found');
    }

    res.json({ success: true, data: resume });
});

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
export const deleteResume = asyncHandler(async (req, res) => {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

    if (!resume) {
        res.status(404);
        throw new Error('Resume not found');
    }

    // Delete from Cloudinary
    try {
        await cloudinary.uploader.destroy(resume.cloudinaryId, { resource_type: 'raw' });
    } catch (err) {
        console.error('Cloudinary deletion error:', err.message);
    }

    await resume.deleteOne();

    res.json({ success: true, message: 'Resume deleted successfully' });
});