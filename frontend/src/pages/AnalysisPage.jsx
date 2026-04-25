import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { analysisAPI } from '../utils/api.js';
import ScoreRing from '../components/ScoreRing.jsx';
import {
    RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import {
    ArrowLeft, CheckCircle2, XCircle, AlertTriangle,
    BookOpen, ExternalLink, Lightbulb, TrendingUp,
    Award, Target, Zap, ChevronDown, ChevronUp
} from 'lucide-react';
import { useState } from 'react';

const categoryColors = {
    technical: 'bg-brand-500/20 text-brand-400 border-brand-500/20',
    soft: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
    tool: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
    language: 'bg-accent-500/20 text-accent-400 border-accent-500/20',
};

const importanceColors = {
    'must-have': 'bg-red-500/20 text-red-400',
    'nice-to-have': 'bg-amber-500/20 text-amber-400',
};

export default function AnalysisPage() {
    const { id } = useParams();
    const [expandedGap, setExpandedGap] = useState(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ['analysis', id],
        queryFn: () => analysisAPI.getOne(id).then(r => r.data.data),
    });

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
                <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-zinc-400">Loading analysis...</p>
            </div>
        </div>
    );

    if (error || !data) return (
        <div className="text-center py-20">
            <p className="text-zinc-400">Analysis not found.</p>
            <Link to="/history" className="btn-primary mt-4 inline-flex">Back to history</Link>
        </div>
    );

    const sections = data.sections || {};
    const sectionData = Object.entries(sections).map(([key, val]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        score: val?.score || 0,
        feedback: val?.feedback,
        present: val?.present,
    }));

    const skillMatchPct = data.matchedSkills?.length && data.skillGaps?.length != null
        ? Math.round((data.matchedSkills.length / (data.matchedSkills.length + data.skillGaps.length)) * 100)
        : null;

    return (
        <div className="space-y-7 animate-slide-up pb-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/history" className="btn-ghost">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>
                <div>
                    <h1 className="font-display font-bold text-2xl text-white">
                        {data.resume?.fileName || 'Resume Analysis'}
                    </h1>
                    {data.jobTitle && (
                        <p className="text-zinc-400 text-sm">Analyzed for: <span className="text-brand-400">{data.jobTitle}</span></p>
                    )}
                </div>
            </div>

            {/* Top scores */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Overall Score', score: data.overallScore, icon: Award },
                    { label: 'ATS Score', score: data.atsScore, icon: Zap },
                    { label: 'Readability', score: data.readabilityScore, icon: BookOpen },
                    { label: 'Skill Match', score: skillMatchPct, icon: Target },
                ].map(({ label, score, icon: Icon }) => (
                    <div key={label} className="glass-card text-center">
                        <ScoreRing score={score} size={80} />
                        <div className="mt-3 text-xs text-zinc-400 font-medium">{label}</div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Section breakdown - Radar */}
                <div className="glass-card">
                    <h2 className="font-display font-semibold text-lg text-white mb-5">Section Breakdown</h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={sectionData}>
                            <PolarGrid stroke="#3f3f46" />
                            <PolarAngleAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                            <Radar name="Score" dataKey="score" stroke="#6172f3" fill="#6172f3" fillOpacity={0.25} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Section details */}
                <div className="glass-card">
                    <h2 className="font-display font-semibold text-lg text-white mb-4">Section Details</h2>
                    <div className="space-y-3">
                        {sectionData.map(({ name, score, feedback, present }) => (
                            <div key={name} className="p-3 rounded-xl bg-zinc-800/40">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        {present === false
                                            ? <XCircle className="w-4 h-4 text-red-400" />
                                            : <CheckCircle2 className="w-4 h-4 text-accent-400" />
                                        }
                                        <span className="text-sm font-medium text-zinc-200">{name}</span>
                                    </div>
                                    <span className="font-mono text-sm font-semibold text-white">{score}/100</span>
                                </div>
                                <div className="w-full bg-zinc-700 rounded-full h-1.5 mb-2">
                                    <div
                                        className="h-1.5 rounded-full transition-all duration-1000"
                                        style={{
                                            width: `${score}%`,
                                            background: score >= 70 ? '#10b981' : score >= 50 ? '#6172f3' : '#f59e0b',
                                        }}
                                    />
                                </div>
                                {feedback && <p className="text-xs text-zinc-400 leading-relaxed">{feedback}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Skills */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Matched skills */}
                <div className="glass-card">
                    <h2 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-accent-400" />
                        Skills You Have ({data.matchedSkills?.length || 0})
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {data.matchedSkills?.length > 0 ? (
                            data.matchedSkills.map(({ skill, category }, i) => (
                                <span key={i} className={`tag border ${categoryColors[category] || 'bg-zinc-700/50 text-zinc-400'}`}>
                                    {skill}
                                </span>
                            ))
                        ) : (
                            <p className="text-zinc-500 text-sm">No job description provided for skill matching.</p>
                        )}
                    </div>
                </div>

                {/* Extracted skills */}
                <div className="glass-card">
                    <h2 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-brand-400" />
                        Your Extracted Skills ({data.extractedSkills?.length || 0})
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {data.extractedSkills?.map(({ name, category, level }, i) => (
                            <span key={i} title={level} className={`tag border ${categoryColors[category] || 'bg-zinc-700/50 text-zinc-400'}`}>
                                {name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Skill Gaps */}
            {data.skillGaps?.length > 0 && (
                <div className="glass-card">
                    <h2 className="font-display font-semibold text-xl text-white mb-2 flex items-center gap-2">
                        <Target className="w-5 h-5 text-amber-400" />
                        Skill Gaps to Close ({data.skillGaps.length})
                    </h2>
                    <p className="text-zinc-400 text-sm mb-5">Skills required by the job that aren't on your resume, with learning resources.</p>
                    <div className="space-y-3">
                        {data.skillGaps.map(({ skill, category, importance, learningResources }, i) => (
                            <div key={i} className={`rounded-xl overflow-hidden border transition-colors ${expandedGap === i ? 'border-brand-500/30' : 'border-zinc-800/60'
                                }`}>
                                <button
                                    onClick={() => setExpandedGap(expandedGap === i ? null : i)}
                                    className="w-full flex items-center gap-3 p-4 bg-zinc-800/40 hover:bg-zinc-800/70 transition-colors text-left"
                                >
                                    <span className={`tag text-xs ${importanceColors[importance] || 'bg-zinc-700 text-zinc-400'}`}>
                                        {importance}
                                    </span>
                                    <span className="font-medium text-zinc-200">{skill}</span>
                                    <span className={`tag border text-xs ml-auto mr-2 ${categoryColors[category] || ''}`}>{category}</span>
                                    {expandedGap === i
                                        ? <ChevronUp className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                                        : <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                                    }
                                </button>
                                {expandedGap === i && learningResources?.length > 0 && (
                                    <div className="p-4 bg-zinc-900/50 space-y-2">
                                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide mb-3">Learning Resources</p>
                                        {learningResources.map((res, j) => (
                                            <a
                                                key={j} href={res.url} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 transition-colors group"
                                            >
                                                <BookOpen className="w-4 h-4 text-brand-400 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm text-zinc-200 truncate group-hover:text-white">{res.title}</div>
                                                    <div className="text-xs text-zinc-500 capitalize">{res.type}</div>
                                                </div>
                                                <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-brand-400 flex-shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Strengths & Weaknesses */}
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="glass-card">
                    <h2 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-accent-400" /> Strengths
                    </h2>
                    <ul className="space-y-2.5">
                        {data.strengths?.map((s, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                                <CheckCircle2 className="w-4 h-4 text-accent-400 mt-0.5 flex-shrink-0" />
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="glass-card">
                    <h2 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-400" /> Areas to Improve
                    </h2>
                    <ul className="space-y-2.5">
                        {data.weaknesses?.map((w, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                                <XCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                {w}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Recommendations */}
            {data.recommendations?.length > 0 && (
                <div className="glass-card border-brand-500/15">
                    <h2 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-brand-400" />
                        Actionable Recommendations
                    </h2>
                    <div className="grid md:grid-cols-2 gap-3">
                        {data.recommendations.map((rec, i) => (
                            <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-brand-600/10 border border-brand-500/15">
                                <span className="w-6 h-6 rounded-full bg-brand-600/30 text-brand-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {i + 1}
                                </span>
                                <p className="text-sm text-zinc-300 leading-relaxed">{rec}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Keywords */}
            <div className="grid lg:grid-cols-2 gap-6">
                {data.keywordsFound?.length > 0 && (
                    <div className="glass-card">
                        <h2 className="font-display font-semibold text-base text-white mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-accent-400" /> Keywords Found
                        </h2>
                        <div className="flex flex-wrap gap-1.5">
                            {data.keywordsFound.map((k, i) => (
                                <span key={i} className="tag bg-accent-500/10 text-accent-400 text-xs">{k}</span>
                            ))}
                        </div>
                    </div>
                )}
                {data.keywordsMissing?.length > 0 && (
                    <div className="glass-card">
                        <h2 className="font-display font-semibold text-base text-white mb-3 flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-400" /> Missing Keywords
                        </h2>
                        <div className="flex flex-wrap gap-1.5">
                            {data.keywordsMissing.map((k, i) => (
                                <span key={i} className="tag bg-red-500/10 text-red-400 text-xs">{k}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Formatting issues */}
            {data.formattingIssues?.length > 0 && (
                <div className="glass-card">
                    <h2 className="font-display font-semibold text-base text-white mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" /> Formatting Issues
                    </h2>
                    <ul className="space-y-2">
                        {data.formattingIssues.map((issue, i) => (
                            <li key={i} className="text-sm text-zinc-400 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                                {issue}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}