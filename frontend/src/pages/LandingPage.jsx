import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Brain, Target, TrendingUp, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
    { icon: Brain, title: 'AI-Powered Analysis', desc: 'Claude AI deeply analyzes your resume structure, content, and impact.' },
    { icon: Target, title: 'Skill Gap Detection', desc: 'Compare your skills against job requirements and find what\'s missing.' },
    { icon: TrendingUp, title: 'ATS Optimization', desc: 'Score your resume against applicant tracking systems used by top employers.' },
    { icon: Sparkles, title: 'Smart Recommendations', desc: 'Get personalized, actionable suggestions to improve your chances.' },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen overflow-hidden">
            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 glass border-b border-zinc-800/40">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" fill="currentColor" />
                    </div>
                    <span className="font-display font-bold text-lg">ScanMyCV</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
                    <Link to="/register" className="btn-primary text-sm">Get started free</Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-40 pb-28 px-8 text-center relative">
                {/* Glow orbs */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-40 left-1/3 w-[300px] h-[200px] bg-accent-500/8 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-4xl mx-auto">

                    <h1 className="font-display font-bold text-6xl lg:text-7xl text-white leading-[1.05] mb-6 tracking-tight">
                        Land your dream job<br />
                        <span className="bg-gradient-to-r from-brand-400 via-brand-300 to-accent-400 bg-clip-text text-transparent">
                            with AI precision
                        </span>
                    </h1>

                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-body">
                        Upload your resume, paste a job description, and get instant AI-powered analysis—
                        scoring, skill gap detection, and actionable recommendations to get hired faster.
                    </p>

                    <div className="flex items-center justify-center gap-4">
                        <Link to="/register" className="btn-primary text-base px-8 py-4">
                            Analyze my resume <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link to="/login" className="btn-secondary text-base px-8 py-4">
                            Sign in
                        </Link>
                    </div>

                    <div className="flex items-center justify-center gap-8 mt-10 text-sm text-zinc-500">
                        {['Free to start', 'No credit card', 'Instant results'].map(t => (
                            <div key={t} className="flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-accent-500" />
                                {t}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-24 px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-display font-bold text-4xl text-white mb-4">
                            Everything you need to stand out
                        </h2>
                        <p className="text-zinc-400 text-lg">Professional-grade tools, AI-powered insights.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {features.map(({ icon: Icon, title, desc }, i) => (
                            <div key={i} className="glass-card hover:border-zinc-700/60 transition-all duration-300 group">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-600/30 to-brand-700/20 border border-brand-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <Icon className="w-5 h-5 text-brand-400" />
                                </div>
                                <h3 className="font-display font-semibold text-lg text-white mb-2">{title}</h3>
                                <p className="text-zinc-400 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-8">
                <div className="max-w-2xl mx-auto text-center glass-card border-brand-500/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 to-accent-500/5 pointer-events-none" />
                    <h2 className="font-display font-bold text-4xl text-white mb-4 relative">
                        Ready to get hired faster?
                    </h2>
                    <p className="text-zinc-400 mb-8 relative">Join thousands of job seekers who optimized their resumes with ResumeIQ.</p>
                    <Link to="/register" className="btn-primary text-base px-8 py-4 relative">
                        Start for free <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}