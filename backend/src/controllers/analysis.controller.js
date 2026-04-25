import asyncHandler from 'express-async-handler';
import https from 'https';
import Resume from '../models/Resume.model.js';
import Analysis from '../models/Analysis.model.js';

// ─── OpenRouter API call ─────────────────────────────────────────────────────

const callOpenRouter = (prompt) => {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            model: 'google/gemma-3-12b-it:free',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 4000,
            temperature: 0.3,
        });

        const options = {
            hostname: 'openrouter.ai',
            path: '/api/v1/chat/completions',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:5000',
                'X-Title': 'ResumeIQ',
                'Content-Length': Buffer.byteLength(body),
            },
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    console.log('OpenRouter raw response:', JSON.stringify(parsed, null, 2));
                    if (parsed.error) {
                        reject(new Error(parsed.error.message || 'OpenRouter API error'));
                    } else if (!parsed.choices || parsed.choices.length === 0) {
                        reject(new Error('No choices returned from OpenRouter'));
                    } else {
                        resolve(parsed.choices[0].message.content);
                    }
                } catch (err) {
                    reject(new Error('Failed to parse OpenRouter response'));
                }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
};

// ─── Prompt builder ──────────────────────────────────────────────────────────

const buildAnalysisPrompt = (resumeText, jobDescription, jobTitle) => `
You are an expert resume analyst and career coach. Analyze this resume thoroughly.

${jobTitle ? `TARGET JOB TITLE: ${jobTitle}` : ''}
${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}` : 'No specific job description provided. Provide general analysis.'}

RESUME TEXT:
${resumeText}

Respond ONLY with valid JSON — no markdown, no backticks, no explanation before or after. Just raw JSON:
{
  "overallScore": <0-100>,
  "atsScore": <0-100>,
  "sections": {
    "contactInfo": { "score": <0-100>, "feedback": "<string>", "present": <boolean> },
    "summary": { "score": <0-100>, "feedback": "<string>", "present": <boolean> },
    "experience": { "score": <0-100>, "feedback": "<string>", "present": <boolean> },
    "education": { "score": <0-100>, "feedback": "<string>", "present": <boolean> },
    "skills": { "score": <0-100>, "feedback": "<string>", "present": <boolean> }
  },
  "extractedSkills": [
    { "name": "<skill>", "category": "<technical|soft|tool|language>", "level": "<beginner|intermediate|advanced|expert>" }
  ],
  "requiredSkills": [
    { "name": "<skill>", "category": "<technical|soft|tool|language>", "importance": "<must-have|nice-to-have>" }
  ],
  "skillGaps": [
    {
      "skill": "<skill name>",
      "category": "<category>",
      "importance": "<must-have|nice-to-have>",
      "learningResources": [
        { "title": "<title>", "url": "<real url>", "type": "<course|article|book|video>" }
      ]
    }
  ],
  "matchedSkills": [
    { "skill": "<skill>", "category": "<category>" }
  ],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "recommendations": ["<actionable recommendation 1>", "<recommendation 2>", "<recommendation 3>"],
  "keywordsFound": ["<keyword>"],
  "keywordsMissing": ["<keyword>"],
  "readabilityScore": <0-100>,
  "formattingIssues": ["<issue>"]
}

Be thorough, specific, and actionable. For skill gaps, provide real learning resources with working URLs.
`;

// ─── Sanitize AI response ────────────────────────────────────────────────────

const sanitizeAnalysisData = (data) => {
    // Sanitize skillGaps
    if (data.skillGaps && Array.isArray(data.skillGaps)) {
        data.skillGaps = data.skillGaps.map(gap => ({
            skill: gap.skill || gap.name || '',
            category: gap.category || 'technical',
            importance: gap.importance || 'nice-to-have',
            learningResources: Array.isArray(gap.learningResources)
                ? gap.learningResources.map(r => ({
                    title: r.title || '',
                    url: r.url || '',
                    type: r.type || 'article',
                }))
                : [],
        }));
    }

    // Sanitize matchedSkills
    if (data.matchedSkills && Array.isArray(data.matchedSkills)) {
        data.matchedSkills = data.matchedSkills.map(s => ({
            skill: s.skill || s.name || '',
            category: s.category || 'technical',
        }));
    }

    // Sanitize extractedSkills
    if (data.extractedSkills && Array.isArray(data.extractedSkills)) {
        data.extractedSkills = data.extractedSkills.map(s => ({
            name: s.name || s.skill || '',
            category: s.category || 'technical',
            level: s.level || 'intermediate',
        }));
    }

    // Sanitize requiredSkills
    if (data.requiredSkills && Array.isArray(data.requiredSkills)) {
        data.requiredSkills = data.requiredSkills.map(s => ({
            name: s.name || s.skill || '',
            category: s.category || 'technical',
            importance: s.importance || 'must-have',
        }));
    }

    // Ensure arrays exist
    data.strengths = Array.isArray(data.strengths) ? data.strengths : [];
    data.weaknesses = Array.isArray(data.weaknesses) ? data.weaknesses : [];
    data.recommendations = Array.isArray(data.recommendations) ? data.recommendations : [];
    data.keywordsFound = Array.isArray(data.keywordsFound) ? data.keywordsFound : [];
    data.keywordsMissing = Array.isArray(data.keywordsMissing) ? data.keywordsMissing : [];
    data.formattingIssues = Array.isArray(data.formattingIssues) ? data.formattingIssues : [];

    // Ensure scores are numbers
    data.overallScore = Number(data.overallScore) || 0;
    data.atsScore = Number(data.atsScore) || 0;
    data.readabilityScore = Number(data.readabilityScore) || 0;

    return data;
};

// ─── Controllers ─────────────────────────────────────────────────────────────

// @desc    Analyze resume with OpenRouter AI
// @route   POST /api/analysis/analyze
// @access  Private
export const analyzeResume = asyncHandler(async (req, res) => {
    const { resumeId, jobDescription, jobTitle } = req.body;

    if (!resumeId) {
        res.status(400);
        throw new Error('Resume ID is required');
    }

    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) {
        res.status(404);
        throw new Error('Resume not found');
    }

    if (!resume.rawText || resume.rawText.trim().length < 50) {
        res.status(400);
        throw new Error('Resume text could not be extracted. Please ensure the file is readable.');
    }

    // Create analysis record
    let analysis = await Analysis.create({
        user: req.user._id,
        resume: resume._id,
        jobDescription: jobDescription || '',
        jobTitle: jobTitle || '',
        status: 'processing',
    });

    resume.analysisId = analysis._id;
    await resume.save();

    try {
        const prompt = buildAnalysisPrompt(resume.rawText, jobDescription, jobTitle);

        console.log('Sending resume to OpenRouter AI...');
        const responseText = await callOpenRouter(prompt);
        console.log('OpenRouter response received, length:', responseText.length);

        let analysisData;
        try {
            const cleaned = responseText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            analysisData = JSON.parse(cleaned);
        } catch (parseError) {
            console.error('JSON parse error:', parseError.message);
            console.error('Raw response preview:', responseText.substring(0, 500));
            throw new Error('Failed to parse AI response as JSON');
        }

        // Sanitize the data before saving to database
        analysisData = sanitizeAnalysisData(analysisData);

        // Save completed analysis
        analysis = await Analysis.findByIdAndUpdate(
            analysis._id,
            { ...analysisData, status: 'completed' },
            { returnDocument: 'after' }
        );

        resume.isAnalyzed = true;
        await resume.save();

        console.log('Analysis completed, overall score:', analysisData.overallScore);
        res.json({ success: true, data: analysis });

    } catch (error) {
        console.error('Analysis error:', error.message);
        await Analysis.findByIdAndUpdate(analysis._id, {
            status: 'failed',
            errorMessage: error.message,
        });
        res.status(500);
        throw new Error(`Analysis failed: ${error.message}`);
    }
});

// @desc    Get all analyses for user
// @route   GET /api/analysis
// @access  Private
export const getAnalyses = asyncHandler(async (req, res) => {
    const analyses = await Analysis.find({ user: req.user._id })
        .populate('resume', 'fileName fileType createdAt')
        .sort({ createdAt: -1 });

    res.json({ success: true, count: analyses.length, data: analyses });
});

// @desc    Get single analysis
// @route   GET /api/analysis/:id
// @access  Private
export const getAnalysis = asyncHandler(async (req, res) => {
    const analysis = await Analysis.findOne({ _id: req.params.id, user: req.user._id })
        .populate('resume', 'fileName fileUrl fileType createdAt');

    if (!analysis) {
        res.status(404);
        throw new Error('Analysis not found');
    }

    res.json({ success: true, data: analysis });
});

// @desc    Delete analysis
// @route   DELETE /api/analysis/:id
// @access  Private
export const deleteAnalysis = asyncHandler(async (req, res) => {
    const analysis = await Analysis.findOne({ _id: req.params.id, user: req.user._id });

    if (!analysis) {
        res.status(404);
        throw new Error('Analysis not found');
    }

    await analysis.deleteOne();
    res.json({ success: true, message: 'Analysis deleted successfully' });
});