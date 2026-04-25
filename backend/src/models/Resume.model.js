import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    fileUrl: {
        type: String,
        required: true,
    },
    cloudinaryId: {
        type: String,
        required: true,
    },
    fileType: {
        type: String,
        enum: ['pdf', 'doc', 'docx'],
        required: true,
    },
    rawText: {
        type: String,
        default: '',
    },
    isAnalyzed: {
        type: Boolean,
        default: false,
    },
    analysisId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Analysis',
    },
}, { timestamps: true });

export default mongoose.model('Resume', resumeSchema);