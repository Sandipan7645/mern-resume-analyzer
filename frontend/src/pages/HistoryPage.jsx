import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analysisAPI } from '../utils/api.js';
import toast from 'react-hot-toast';
import ScoreRing from '../components/ScoreRing.jsx';
import { ArrowRight, Trash2, Upload, Clock, Briefcase } from 'lucide-react';

export default function HistoryPage() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['analyses'],
        queryFn: () => analysisAPI.getAll().then(r => r.data),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => analysisAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['analyses'] });
            toast.success('Analysis deleted');
        },
        onError: () => toast.error('Failed to delete'),
    });

    const analyses = data?.data || [];

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display font-bold text-3xl text-white mb-1">Analysis History</h1>
                    <p className="text-zinc-400">{analyses.length} resume{analyses.length !== 1 ? 's' : ''} analyzed</p>
                </div>
                <Link to="/upload" className="btn-primary">
                    <Upload className="w-4 h-4" /> New Analysis
                </Link>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="glass-card animate-pulse h-28" />
                    ))}
                </div>
            ) : analyses.length === 0 ? (
                <div className="glass-card text-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-7 h-7 text-zinc-600" />
                    </div>
                    <h3 className="font-display font-semibold text-lg text-white mb-2">No analyses yet</h3>
                    <p className="text-zinc-400 mb-6">Upload a resume to get your first AI-powered analysis.</p>
                    <Link to="/upload" className="btn-primary inline-flex">
                        <Upload className="w-4 h-4" /> Analyze a resume
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {analyses.map((analysis) => (
                        <div key={analysis._id} className="glass-card flex items-center gap-6 hover:border-zinc-700/60 transition-colors">
                            <ScoreRing score={analysis.overallScore} size={72} />

                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-white mb-0.5 truncate">
                                    {analysis.resume?.fileName || 'Resume'}
                                </div>
                                {analysis.jobTitle && (
                                    <div className="flex items-center gap-1.5 text-sm text-brand-400 mb-1.5">
                                        <Briefcase className="w-3.5 h-3.5" />
                                        {analysis.jobTitle}
                                    </div>
                                )}
                                <div className="flex items-center gap-4 text-xs text-zinc-500">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(analysis.createdAt).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', year: 'numeric',
                                        })}
                                    </div>
                                    {analysis.atsScore != null && (
                                        <span>ATS: <span className="text-zinc-400">{analysis.atsScore}%</span></span>
                                    )}
                                    {analysis.skillGaps?.length != null && (
                                        <span>Skill gaps: <span className="text-amber-400">{analysis.skillGaps.length}</span></span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Link to={`/analysis/${analysis._id}`} className="btn-secondary text-sm px-4 py-2">
                                    View <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                                <button
                                    onClick={() => {
                                        if (confirm('Delete this analysis?')) deleteMutation.mutate(analysis._id);
                                    }}
                                    className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}