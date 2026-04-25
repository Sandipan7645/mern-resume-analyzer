import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeAPI, analysisAPI } from '../utils/api.js';
import toast from 'react-hot-toast';
import {
    Upload, FileText, X, Briefcase, Sparkles, CheckCircle2,
    Loader2, ChevronDown, ChevronUp
} from 'lucide-react';

export default function UploadPage() {
    const [searchParams] = useSearchParams();
    const preselectedResumeId = searchParams.get('resumeId');

    const [uploadedFile, setUploadedFile] = useState(null);
    const [selectedResumeId, setSelectedResumeId] = useState(preselectedResumeId || '');
    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [showExisting, setShowExisting] = useState(!!preselectedResumeId);

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: resumesData } = useQuery({
        queryKey: ['resumes'],
        queryFn: () => resumeAPI.getAll().then(r => r.data),
    });
    const resumes = resumesData?.data || [];

    // Upload resume mutation
    const uploadMutation = useMutation({
        mutationFn: async (file) => {
            const fd = new FormData();
            fd.append('resume', file);
            return resumeAPI.upload(fd);
        },
        onSuccess: (res) => {
            const resume = res.data.data;
            setSelectedResumeId(resume._id);
            queryClient.invalidateQueries({ queryKey: ['resumes'] });
            toast.success('Resume uploaded successfully!');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Upload failed');
        },
    });

    // Analyze mutation
    const analyzeMutation = useMutation({
        mutationFn: (data) => analysisAPI.analyze(data),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['analyses'] });
            queryClient.invalidateQueries({ queryKey: ['resumes'] });
            toast.success('Analysis complete!');
            navigate(`/analysis/${res.data.data._id}`);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Analysis failed');
        },
    });

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;
        setUploadedFile(file);
        await uploadMutation.mutateAsync(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        maxSize: 5 * 1024 * 1024,
        multiple: false,
        onDropRejected: (files) => {
            const err = files[0]?.errors[0];
            toast.error(err?.code === 'file-too-large' ? 'File too large (max 5MB)' : 'Invalid file type');
        },
    });

    const handleAnalyze = () => {
        if (!selectedResumeId) {
            toast.error('Please upload or select a resume first');
            return;
        }
        analyzeMutation.mutate({
            resumeId: selectedResumeId,
            jobTitle: jobTitle.trim(),
            jobDescription: jobDescription.trim(),
        });
    };

    const isLoading = uploadMutation.isPending || analyzeMutation.isPending;
    const selectedResume = resumes.find(r => r._id === selectedResumeId);

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
            <div>
                <h1 className="font-display font-bold text-3xl text-white mb-1">Analyze Resume</h1>
                <p className="text-zinc-400">Upload your resume and optionally add a job description for targeted analysis.</p>
            </div>

            {/* Upload zone */}
            <div className="glass-card space-y-4">
                <h2 className="font-display font-semibold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-400" />
                    Resume
                </h2>

                {/* Dropzone */}
                <div
                    {...getRootProps()}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${isDragActive
                            ? 'border-brand-500 bg-brand-500/10'
                            : selectedResumeId && !uploadMutation.isPending
                                ? 'border-accent-500/50 bg-accent-500/5'
                                : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/30'
                        }`}
                >
                    <input {...getInputProps()} />
                    {uploadMutation.isPending ? (
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
                            <p className="text-zinc-300 font-medium">Uploading & extracting text...</p>
                        </div>
                    ) : selectedResumeId && !uploadedFile ? (
                        <div className="flex flex-col items-center gap-3">
                            <CheckCircle2 className="w-10 h-10 text-accent-400" />
                            <p className="text-zinc-200 font-medium">{selectedResume?.fileName}</p>
                            <p className="text-zinc-500 text-sm">Drop a new file to replace</p>
                        </div>
                    ) : uploadedFile && selectedResumeId ? (
                        <div className="flex flex-col items-center gap-3">
                            <CheckCircle2 className="w-10 h-10 text-accent-400" />
                            <p className="text-zinc-200 font-medium">{uploadedFile.name}</p>
                            <p className="text-xs text-zinc-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-brand-600/15 border border-brand-500/20 flex items-center justify-center">
                                <Upload className="w-6 h-6 text-brand-400" />
                            </div>
                            <div>
                                <p className="text-zinc-200 font-medium mb-1">
                                    {isDragActive ? 'Drop it here!' : 'Drop your resume here'}
                                </p>
                                <p className="text-zinc-500 text-sm">PDF, DOC, DOCX — up to 5MB</p>
                            </div>
                            <span className="btn-secondary text-sm px-4 py-2 pointer-events-none">
                                Browse files
                            </span>
                        </div>
                    )}
                </div>

                {/* Or select existing */}
                {resumes.length > 0 && (
                    <div>
                        <button
                            onClick={() => setShowExisting(p => !p)}
                            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                            {showExisting ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            Or choose from {resumes.length} existing resume{resumes.length !== 1 ? 's' : ''}
                        </button>
                        {showExisting && (
                            <div className="mt-3 space-y-2">
                                {resumes.map(r => (
                                    <button
                                        key={r._id}
                                        onClick={() => { setSelectedResumeId(r._id); setUploadedFile(null); }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${selectedResumeId === r._id
                                                ? 'bg-brand-600/20 border border-brand-500/30 text-brand-300'
                                                : 'bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300'
                                            }`}
                                    >
                                        <FileText className="w-4 h-4 flex-shrink-0" />
                                        <span className="text-sm truncate">{r.fileName}</span>
                                        {r.isAnalyzed && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-accent-400 flex-shrink-0" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Job Description */}
            <div className="glass-card space-y-4">
                <h2 className="font-display font-semibold text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-brand-400" />
                    Job Details <span className="text-sm font-normal text-zinc-500">(optional but recommended)</span>
                </h2>

                <div>
                    <label className="label">Job title</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. Senior Frontend Engineer"
                        value={jobTitle}
                        onChange={e => setJobTitle(e.target.value)}
                    />
                </div>

                <div>
                    <label className="label">Job description</label>
                    <textarea
                        className="input-field min-h-40 resize-y"
                        placeholder="Paste the full job description here for targeted skill gap analysis..."
                        value={jobDescription}
                        onChange={e => setJobDescription(e.target.value)}
                    />
                    <p className="text-xs text-zinc-500 mt-1.5">
                        Adding a job description enables skill gap detection and ATS keyword matching.
                    </p>
                </div>
            </div>

            {/* Submit */}
            <button
                onClick={handleAnalyze}
                disabled={isLoading || !selectedResumeId}
                className="btn-primary w-full justify-center py-4 text-base"
            >
                {analyzeMutation.isPending ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing with AI...</>
                ) : (
                    <><Sparkles className="w-5 h-5" /> Analyze Resume</>
                )}
            </button>

            {analyzeMutation.isPending && (
                <div className="glass-card text-center py-4">
                    <p className="text-zinc-300 text-sm font-medium mb-1">🤖 Claude AI is analyzing your resume...</p>
                    <p className="text-zinc-500 text-xs">This usually takes 10–30 seconds</p>
                </div>
            )}
        </div>
    );
}