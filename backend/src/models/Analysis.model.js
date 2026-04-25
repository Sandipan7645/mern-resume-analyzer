import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    resume: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        required: true,
    },
    jobDescription: {
        type: String,
        default: '',
    },
    jobTitle: {
        type: String,
        default: '',
    },
    overallScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    atsScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    sections: {
        contactInfo: {
            score: { type: Number, default: 0 },
            feedback: { type: String, default: '' },
            present: { type: Boolean, default: false },
        },
        summary: {
            score: { type: Number, default: 0 },
            feedback: { type: String, default: '' },
            present: { type: Boolean, default: false },
        },
        experience: {
            score: { type: Number, default: 0 },
            feedback: { type: String, default: '' },
            present: { type: Boolean, default: false },
        },
        education: {
            score: { type: Number, default: 0 },
            feedback: { type: String, default: '' },
            present: { type: Boolean, default: false },
        },
        skills: {
            score: { type: Number, default: 0 },
            feedback: { type: String, default: '' },
            present: { type: Boolean, default: false },
        },
    },
    extractedSkills: [
        new mongoose.Schema({
            name: { type: String, default: '' },
            category: { type: String, default: 'technical' },
            level: { type: String, default: 'intermediate' },
        }, { _id: false })
    ],
    requiredSkills: [
        new mongoose.Schema({
            name: { type: String, default: '' },
            category: { type: String, default: 'technical' },
            importance: { type: String, default: 'must-have' },
        }, { _id: false })
    ],
    skillGaps: [
        new mongoose.Schema({
            skill: { type: String, default: '' },
            category: { type: String, default: 'technical' },
            importance: { type: String, default: 'nice-to-have' },
            learningResources: [
                new mongoose.Schema({
                    title: { type: String, default: '' },
                    url: { type: String, default: '' },
                    type: { type: String, default: 'article' },
                }, { _id: false })
            ],
        }, { _id: false })
    ],
    matchedSkills: [
        new mongoose.Schema({
            skill: { type: String, default: '' },
            category: { type: String, default: 'technical' },
        }, { _id: false })
    ],
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendations: [{ type: String }],
    keywordsFound: [{ type: String }],
    keywordsMissing: [{ type: String }],
    readabilityScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    formattingIssues: [{ type: String }],
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending',
    },
    errorMessage: {
        type: String,
        default: '',
    },
}, { timestamps: true });

export default mongoose.model('Analysis', analysisSchema);