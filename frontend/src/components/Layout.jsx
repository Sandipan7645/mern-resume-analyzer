import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
    LayoutDashboard, Upload, History, LogOut,
    Zap, User, ChevronRight
} from 'lucide-react';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/upload', icon: Upload, label: 'Analyze Resume' },
    { to: '/history', icon: History, label: 'History' },
];

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 glass border-r border-zinc-800/60 flex flex-col fixed h-screen z-30">
                {/* Logo */}
                <div className="p-6 border-b border-zinc-800/60">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-900/30">
                            <Zap className="w-5 h-5 text-white" fill="currentColor" />
                        </div>
                        <div>
                            <span className="font-display font-bold text-lg text-white">ScanMyCV</span>
                            <div className="text-xs text-zinc-500 -mt-0.5">AI-Powered Analysis</div>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${isActive
                                    ? 'bg-brand-600/20 text-brand-400 border border-brand-500/20'
                                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                                }`
                            }
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {label}
                            <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </NavLink>
                    ))}
                </nav>

                {/* User */}
                <div className="p-4 border-t border-zinc-800/60">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-zinc-800/50 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-zinc-200 truncate">{user?.name}</div>
                            <div className="text-xs text-zinc-500 truncate">{user?.email}</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 ml-64 min-h-screen">
                <div className="max-w-6xl mx-auto px-8 py-8 animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}