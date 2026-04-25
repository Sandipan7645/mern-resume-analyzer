export default function ScoreRing({ score, size = 80, strokeWidth = 6 }) {
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const pct = score != null ? Math.min(Math.max(score, 0), 100) : 0;
    const offset = circumference - (pct / 100) * circumference;

    const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#6172f3' : pct >= 40 ? '#f59e0b' : '#ef4444';
    const label = pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : pct >= 40 ? 'Fair' : 'Needs Work';

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    <circle
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke="#27272a" strokeWidth={strokeWidth}
                    />
                    <circle
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke={color} strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.3s ease' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display font-bold text-white" style={{ fontSize: size * 0.24 }}>
                        {score ?? '—'}
                    </span>
                </div>
            </div>
            <span className="text-xs font-medium" style={{ color }}>{score != null ? label : 'Pending'}</span>
        </div>
    );
}