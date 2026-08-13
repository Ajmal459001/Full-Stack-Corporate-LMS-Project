import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence, useSpring, animate } from 'motion/react';
import { 
    BarChart3, Users, DollarSign, ChevronDown, 
    ArrowLeft, Loader2, AlertCircle, Star, BookOpen,
    Home, GraduationCap, Settings, HelpCircle, LogOut, TrendingUp, TrendingDown,
    Menu, X
} from 'lucide-react';

// ==========================================
// Reusable Animation Components
// ==========================================
const AnimatedCounter = ({ value, prefix = "", suffix = "", decimals = 0 }) => {
    const nodeRef = useRef(null);

    useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;
        
        const controls = animate(0, value, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate(currentValue) {
                if (nodeRef.current) {
                    nodeRef.current.textContent = prefix + currentValue.toFixed(decimals) + suffix;
                }
            }
        });
        
        return () => controls.stop();
    }, [value, prefix, suffix, decimals]);

    return <span ref={nodeRef}>{prefix}{(0).toFixed(decimals)}{suffix}</span>;
};

const CircularProgress = ({ 
    percentage, 
    size = 80, 
    strokeWidth = 8, 
    colorClass = "text-primary", 
    trackColorClass = "text-gray-200 dark:text-white/10",
    isGradient = false 
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const [offset, setOffset] = useState(circumference);

    useEffect(() => {
        // Slight delay to ensure it animates smoothly after mount
        const timeout = setTimeout(() => {
            setOffset(circumference - (percentage / 100) * circumference);
        }, 100);
        return () => clearTimeout(timeout);
    }, [percentage, circumference]);

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {isGradient && (
                    <defs>
                        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#4F46E5" /> {/* Indigo */}
                            <stop offset="50%" stopColor="#9333EA" /> {/* Purple */}
                            <stop offset="100%" stopColor="#3B82F6" /> {/* Blue */}
                        </linearGradient>
                    </defs>
                )}
                {/* Background Track */}
                <circle 
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke="currentColor" strokeWidth={strokeWidth}
                    fill="transparent"
                    className={trackColorClass}
                />
                {/* Foreground Ring */}
                <circle 
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke={isGradient && percentage > 0 ? "url(#ringGradient)" : percentage > 0 ? "currentColor" : "transparent"} 
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`transition-all duration-[1500ms] ease-out ${!isGradient ? colorClass : ''}`}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-black" style={{ fontSize: size * 0.28 }}>
                <AnimatedCounter value={percentage} suffix="%" />
            </div>
        </div>
    );
};

// ==========================================
// Main Dashboard Component
// ==========================================
const AnalyticsDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [error, setError] = useState('');
    const [expandedCourse, setExpandedCourse] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    useEffect(() => {
        const fetchTelemetry = async () => {
            try {
                // Fetch analytics data
                const res = await api.get('/api/courses/analytics/');
                setAnalytics(res.data);
                
                // Fetch user data for the avatar
                try {
                    const userRes = await api.get('/api/auth/user/');
                    setUserProfile(userRes.data);
                } catch (e) {
                    console.error("Failed to load user profile");
                }

            } catch (err) {
                console.error(err);
                setError('Failed to load telemetry data. Ensure you have instructor access.');
            }
        };
        fetchTelemetry();
    }, []);

    // Framer Motion Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { 
            opacity: 1, 
            transition: { staggerChildren: 0.1, delayChildren: 0.1 } 
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { 
            opacity: 1, 
            y: 0, 
            transition: { type: "spring", stiffness: 300, damping: 24 } 
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#07090D] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Access Error</h2>
                <p className="text-muted-foreground mb-8 max-w-md">{error}</p>
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-6 py-3 bg-secondary text-foreground hover:bg-secondary/80 rounded-xl font-bold transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#07090D] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-medium">Gathering telemetry data...</p>
            </div>
        );
    }

    const navItems = [
        { icon: Home, label: "Overview", active: false },
        { icon: BookOpen, label: "My Courses", active: false },
        { icon: Users, label: "Students", active: false },
        { icon: BarChart3, label: "Analytics", active: true },
        { icon: DollarSign, label: "Earnings", active: false },
    ];

    const bottomNavItems = [
        { icon: Settings, label: "Settings", action: () => {} },
        { icon: HelpCircle, label: "Help", action: () => {} },
        { icon: LogOut, label: "Log out", action: () => {} },
    ];

    return (
        <div className="min-h-screen flex bg-[#F6F8FD] dark:bg-[#07090D] text-foreground font-sans overflow-hidden">
            
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside 
                className={`fixed lg:static inset-y-0 left-0 w-64 bg-[#FFFFFF] dark:bg-[#090C12] border-r border-gray-200 dark:border-white/10 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                        <span className="font-bold text-lg leading-tight dark:text-slate-50">
                            Instructor<br/>Command Center
                        </span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {navItems.map((item, idx) => (
                        <button key={idx} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                            item.active 
                            ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-slate-50 font-bold' 
                            : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-slate-50'
                        }`}>
                            <item.icon className={`w-5 h-5 ${item.active ? 'text-blue-600 dark:text-blue-500' : ''}`} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-white/10 space-y-1">
                    {bottomNavItems.map((item, idx) => (
                        <button key={idx} onClick={item.action} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-slate-50 transition-colors">
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative scroll-smooth">
                
                {/* Header */}
                <header className="px-6 lg:px-10 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 bg-[#F6F8FD]/80 dark:bg-[#07090D]/80 backdrop-blur-md z-30">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-[#FFFFFF] dark:bg-[#11161F] rounded-lg shadow-sm border border-border dark:border-white/10">
                            <Menu className="w-5 h-5 dark:text-slate-300" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-foreground dark:text-slate-50">
                                Instructor Command Center
                            </h1>
                            <p className="text-gray-500 dark:text-slate-400 text-sm mt-1 font-medium">Global Telemetry, Finance & Qualitative Feedback</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 self-end sm:self-auto">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:opacity-90 text-white rounded-full font-bold text-sm transition-all shadow-md hover:shadow-lg dark:hover:shadow-indigo-500/20"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                        </button>
                        
                        <div className="flex items-center gap-3 bg-[#FFFFFF] dark:bg-[#151B26] p-1.5 pr-4 rounded-full shadow-sm border border-gray-200 dark:border-white/10">
                            <img 
                                src={`https://ui-avatars.com/api/?name=${userProfile?.username || 'John+Doe'}&background=random`} 
                                alt="User Avatar" 
                                className="w-8 h-8 rounded-full border border-gray-100 dark:border-white/5" 
                            />
                            <span className="font-bold text-sm whitespace-nowrap dark:text-slate-50">{userProfile?.username || "John Doe"}</span>
                        </div>
                    </div>
                </header>

                {/* Staggered Grid Content */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="px-6 lg:px-10 pb-12 pt-4 flex-1 flex flex-col gap-8"
                >
                    {/* Top Stat Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        
                        {/* 1. Published Tracks */}
                        <motion.div variants={itemVariants} whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)" }} className="bg-[#FFFFFF] dark:bg-[#11161F] p-6 rounded-[2rem] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-none border border-gray-100 dark:border-white/10 flex flex-col justify-between transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-500">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-1 bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400 px-2 py-1 rounded-md text-xs font-bold">
                                    <TrendingUp className="w-3 h-3" /> +3.2%
                                </div>
                            </div>
                            <div>
                                <h6 className="text-gray-400 dark:text-slate-400 text-xs uppercase font-bold tracking-widest mb-1">Published Tracks</h6>
                                <h2 className="text-4xl font-black text-foreground dark:text-slate-50">
                                    <AnimatedCounter value={analytics.total_courses} />
                                </h2>
                            </div>
                        </motion.div>

                        {/* 2. Active Students */}
                        <motion.div variants={itemVariants} whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)" }} className="bg-[#FFFFFF] dark:bg-[#11161F] p-6 rounded-[2rem] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-none border border-gray-100 dark:border-white/10 flex flex-col justify-between transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-500/15 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-1 bg-red-50 dark:bg-red-500/15 text-red-500 dark:text-red-400 px-2 py-1 rounded-md text-xs font-bold">
                                    <TrendingDown className="w-3 h-3" /> -1.5%
                                </div>
                            </div>
                            <div>
                                <h6 className="text-gray-400 dark:text-slate-400 text-xs uppercase font-bold tracking-widest mb-1">Active Students</h6>
                                <h2 className="text-4xl font-black text-foreground dark:text-slate-50">
                                    <AnimatedCounter value={analytics.total_students} />
                                </h2>
                            </div>
                        </motion.div>

                        {/* 3. Global Completion Gradient Hero */}
                        <motion.div variants={itemVariants} whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }} className="bg-gradient-to-br from-indigo-400 via-purple-400 to-blue-400 dark:from-[#4F46E5] dark:via-[#8B5CF6] dark:to-[#3B82F6] p-6 rounded-[2rem] shadow-lg dark:shadow-indigo-500/10 text-white flex flex-col items-center justify-between transition-shadow relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent pointer-events-none" />
                            <h6 className="uppercase tracking-widest text-xs font-bold text-white/90 w-full text-left relative z-10">Global Completion</h6>
                            <div className="mt-2 relative z-10">
                                <CircularProgress 
                                    percentage={analytics.overall_completion_rate} 
                                    size={110} 
                                    strokeWidth={10} 
                                    colorClass="text-white" 
                                    trackColorClass="text-white/20 dark:text-white/10"
                                />
                            </div>
                            <div className="absolute bottom-4 right-4 text-white/50 bg-white/10 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold backdrop-blur-sm cursor-help">
                                ?
                            </div>
                        </motion.div>

                        {/* 4. Total Earnings */}
                        <motion.div variants={itemVariants} whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)" }} className="bg-[#FFFFFF] dark:bg-[#11161F] p-6 rounded-[2rem] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-none border border-gray-100 dark:border-white/10 flex flex-col justify-between transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-yellow-50 dark:bg-yellow-500/15 flex items-center justify-center text-yellow-500 dark:text-yellow-400">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-1 bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400 px-2 py-1 rounded-md text-xs font-bold">
                                    <TrendingUp className="w-3 h-3" /> +5.1%
                                </div>
                            </div>
                            <div>
                                <h6 className="text-gray-400 dark:text-slate-400 text-xs uppercase font-bold tracking-widest mb-1">Total Earnings</h6>
                                <h2 className="text-4xl font-black text-foreground dark:text-slate-50">
                                    <AnimatedCounter value={analytics.total_revenue || 0} prefix="$" decimals={2} />
                                </h2>
                            </div>
                        </motion.div>
                    </div>

                    <div className="pt-2">
                        <h3 className="text-2xl font-bold text-foreground dark:text-slate-50 mb-6">Course Performance Matrix</h3>

                        {analytics.course_breakdown.length === 0 ? (
                            <div className="text-center py-20 border border-dashed border-gray-200 dark:border-white/10 rounded-3xl bg-[#FFFFFF] dark:bg-[#11161F] max-w-3xl mx-auto shadow-sm dark:shadow-none">
                                <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-500">
                                    <BarChart3 className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground dark:text-slate-50 mb-3">No analytics available</h3>
                                <p className="text-gray-500 dark:text-slate-400 text-lg font-medium">Publish your first course and enroll students to start gathering data.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {analytics.course_breakdown.map((course) => (
                                    <motion.div 
                                        key={course.id} 
                                        variants={itemVariants}
                                        whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)" }}
                                        className="bg-[#FFFFFF] dark:bg-[#11161F] rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm dark:shadow-none overflow-hidden flex flex-col transition-shadow"
                                    >
                                        <div className="p-8 pb-6">
                                            <div className="flex justify-between items-start gap-4 mb-4">
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        <span className="px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300 text-[10px] font-bold uppercase tracking-widest">
                                                            {course.category}
                                                        </span>
                                                        <span className="px-3 py-1 rounded-md bg-yellow-50 dark:bg-yellow-500/15 text-yellow-600 dark:text-yellow-300 text-[10px] font-bold tracking-widest uppercase">
                                                            ${course.revenue?.toFixed(2)} Earned
                                                        </span>
                                                    </div>
                                                    <h4 className="text-xl font-bold leading-tight text-foreground dark:text-slate-50">{course.title}</h4>
                                                </div>
                                                
                                                {/* Circular Progress Ring */}
                                                <div className="flex-shrink-0">
                                                    <CircularProgress 
                                                        percentage={course.completion_rate} 
                                                        size={80} 
                                                        strokeWidth={8}
                                                        isGradient={true}
                                                        trackColorClass="text-gray-100 dark:text-white/10"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center text-sm mt-6 pt-6 border-t border-gray-100 dark:border-white/10">
                                                <span className="text-gray-500 dark:text-slate-400 font-medium">Total Enrollments: <span className="text-foreground dark:text-slate-50 font-bold">{course.total_students}</span></span>
                                                <button 
                                                    onClick={() => navigate(`/manage/course/${course.id}`)}
                                                    className="text-blue-600 dark:text-blue-500 font-bold hover:text-blue-700 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
                                                >
                                                    Manage Course &rarr;
                                                </button>
                                            </div>
                                        </div>

                                        {/* Custom Accordion for Reviews */}
                                        <div className="bg-gray-50/50 dark:bg-[#0F141C] flex-1 flex flex-col border-t border-gray-100 dark:border-white/10">
                                            <button 
                                                onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                                                className="w-full px-8 py-5 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-[#151B26] transition-colors font-bold text-sm text-foreground dark:text-slate-50"
                                            >
                                                <span className="flex items-center gap-2">
                                                    Student Feedback 
                                                    <span className="bg-indigo-500 text-white text-xs px-2.5 py-0.5 rounded-full">{course.reviews?.length || 0}</span>
                                                </span>
                                                <ChevronDown className={`w-5 h-5 text-gray-400 dark:text-slate-400 transition-transform duration-300 ${expandedCourse === course.id ? 'rotate-180' : ''}`} />
                                            </button>

                                            <AnimatePresence>
                                                {expandedCourse === course.id && (
                                                    <motion.div 
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-8 pb-6 pt-1 space-y-3">
                                                            {course.reviews && course.reviews.length > 0 ? (
                                                                course.reviews.map((rev, i) => (
                                                                    <div key={i} className="bg-[#FFFFFF] dark:bg-[#151B26] border border-gray-100 dark:border-white/5 rounded-xl p-4 shadow-sm dark:shadow-none">
                                                                        <div className="flex justify-between items-center mb-2">
                                                                            <strong className="text-foreground dark:text-slate-50 text-sm font-bold">{rev.username}</strong>
                                                                            <div className="flex items-center gap-1 text-yellow-400 dark:text-yellow-500 text-xs font-bold tracking-widest">
                                                                                {rev.rating} <Star className="w-3.5 h-3.5 fill-current" />
                                                                            </div>
                                                                        </div>
                                                                        <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed font-medium">{rev.comment}</p>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="text-center py-6 text-gray-400 dark:text-slate-500 text-sm font-medium border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                                                                    No student reviews have been left yet.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default AnalyticsDashboard;