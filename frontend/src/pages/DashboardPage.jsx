import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { resumeAPI, analysisAPI } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
    Upload, FileText, TrendingUp, Target, ArrowRight,
    Clock, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import ScoreRing from '../components/ScoreRing.jsx';

export default function DashboardPage() {
    const { user } = useAuth();

    const { data: resumesData } = useQuery({
        queryKey: ['resumes'],
        queryFn: () => resumeAPI.getAll().then(r => r.data),
    });

    const { data: analysesData } = useQuery({
        queryKey: ['analyses'],
        queryFn: () => analysisAPI.getAll().then(r => r.data),
    });

    const resumes = resumesData?.data || [];
    const analyses = analysesData?.data || [];
    const latestAnalysis = analyses[0];
    const avgScore = analyses.length
        ? Math.round(analyses.filter(a => a.overallScore).reduce((s, a) => s + a.overallScore, 0) / analyses.filter(a => a.overallScore).length)
        : null;

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="space-y-8 animate-slide-up">
            {/* Header */}
            <div>
                <h1 className="font-display font-bold text-3xl text-white mb-1">
                    {greeting()}, {user?.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-zinc-400">Here's an overview of your resume performance.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-5">
                {[
                    { label: 'Resumes uploaded', value: resumes.length, icon: FileText, color: 'text-brand-400', bg: 'from-brand-600/20 to-brand-700/10 border-brand-500/20' },
                    { label: 'Analyses run', value: analyses.length, icon: TrendingUp, color: 'text-accent-400', bg: 'from-accent-500/20 to-accent-600/10 border-accent-500/20' },
                    { label: 'Avg. overall score', value: avgScore ? `${avgScore}/100` : '—', icon: Target, color: 'text-amber-400', bg: 'from-amber-500/20 to-amber-600/10 border-amber-500/20' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className={`glass-card bg-gradient-to-br ${bg} border`}>
                        <div className={`w-10 h-10 rounded-xl bg-zinc-900/50 flex items-center justify-center mb-4 ${color}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div className="font-display font-bold text-3xl text-white mb-1">{value}</div>
                        <div className="text-sm text-zinc-400">{label}</div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Latest analysis */}
                <div className="glass-card">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-display font-semibold text-lg text-white">Latest Analysis</h2>
                        {analyses.length > 0 && (
                            <Link to="/history" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
                                View all <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        )}
                    </div>

                    {latestAnalysis ? (
                        <div className="flex items-center gap-6">
                            <ScoreRing score={latestAnalysis.overallScore} size={90} />
                            <div className="flex-1">
                                <div className="font-medium text-white mb-1">
                                    {latestAnalysis.resume?.fileName || 'Resume'}
                                </div>
                                {latestAnalysis.jobTitle && (
                                    <div className="text-sm text-zinc-400 mb-3">for {latestAnalysis.jobTitle}</div>
                                )}
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {[
                                        { label: 'ATS Score', val: latestAnalysis.atsScore },
                                        {
                                            label: 'Skill Match', val: latestAnalysis.matchedSkills?.length > 0
                                                ? Math.round((latestAnalysis.matchedSkills.length / (latestAnalysis.matchedSkills.length + latestAnalysis.skillGaps.length)) * 100)
                                                : null
                                        },
                                    ].map(({ label, val }) => (
                                        <div key={label} className="bg-zinc-800/60 rounded-lg p-2.5">
                                            <div className="text-xs text-zinc-500 mb-0.5">{label}</div>
                                            <div className="font-mono font-medium text-white">{val ?? '—'}{val != null ? '%' : ''}</div>
                                        </div>
                                    ))}
                                </div>
                                <Link to={`/analysis/${latestAnalysis._id}`} className="btn-secondary text-sm px-4 py-2">
                                    View details <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="w-7 h-7 text-zinc-600" />
                            </div>
                            <p className="text-zinc-400 mb-4">No analyses yet</p>
                            <Link to="/upload" className="btn-primary text-sm">
                                Analyze your first resume
                            </Link>
                        </div>
                    )}
                </div>

                {/* Quick upload */}
                <div className="glass-card border-dashed border-2 border-zinc-700 hover:border-brand-500/50 transition-colors group cursor-pointer relative overflow-hidden">
                    <Link to="/upload" className="absolute inset-0 z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="text-center py-8 relative">
                        <div className="w-16 h-16 rounded-2xl bg-brand-600/15 border border-brand-500/20 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                            <Upload className="w-7 h-7 text-brand-400" />
                        </div>
                        <h3 className="font-display font-semibold text-lg text-white mb-2">Analyze a resume</h3>
                        <p className="text-zinc-400 text-sm max-w-48 mx-auto leading-relaxed">
                            Upload PDF or Word doc and get instant AI feedback
                        </p>
                    </div>
                </div>
            </div>

            {/* Recent Resumes */}
            {resumes.length > 0 && (
                <div className="glass-card">
                    <h2 className="font-display font-semibold text-lg text-white mb-5">Recent Resumes</h2>
                    <div className="space-y-3">
                        {resumes.slice(0, 5).map((resume) => (
                            <div key={resume._id} className="flex items-center gap-4 p-3 rounded-xl bg-zinc-800/40 hover:bg-zinc-800/70 transition-colors">
                                <div className="w-9 h-9 rounded-lg bg-zinc-700/60 flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-4 h-4 text-zinc-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-zinc-200 text-sm truncate">{resume.fileName}</div>
                                    <div className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                                        <Clock className="w-3 h-3" />
                                        {new Date(resume.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                {resume.isAnalyzed ? (
                                    <span className="tag bg-accent-500/15 text-accent-400">
                                        <CheckCircle2 className="w-3 h-3" /> Analyzed
                                    </span>
                                ) : (
                                    <Link to={`/upload?resumeId=${resume._id}`} className="tag bg-brand-500/15 text-brand-400 hover:bg-brand-500/25 transition-colors">
                                        <Target className="w-3 h-3" /> Analyze
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}