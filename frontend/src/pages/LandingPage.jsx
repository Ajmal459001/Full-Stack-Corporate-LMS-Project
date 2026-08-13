import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, useScroll, useTransform, AnimatePresence, animate } from 'motion/react';
import { 
    LogIn, ArrowRight, Zap, Shield, BarChart3, Trophy, 
    Menu, X, PlayCircle, MonitorPlay, Target, Lock, Layers, Users, Star, CheckCircle2, TrendingUp,
    Sun, Moon, Award, Calendar
} from 'lucide-react';

// ==========================================
// Reusable Animation & UI Components
// ==========================================
const AnimatedCounter = ({ value, prefix = "", suffix = "", decimals = 0, duration = 2 }) => {
    const nodeRef = useRef(null);
    useEffect(() => {
        if (!nodeRef.current) return;
        const controls = animate(0, value, {
            duration,
            ease: "easeOut",
            onUpdate(currentValue) {
                if (nodeRef.current) {
                    nodeRef.current.textContent = prefix + currentValue.toFixed(decimals) + suffix;
                }
            }
        });
        return () => controls.stop();
    }, [value, prefix, suffix, decimals, duration]);
    return <span ref={nodeRef}>{prefix}{(0).toFixed(decimals)}{suffix}</span>;
};

const CircularProgress = ({ percentage, size = 80, strokeWidth = 8, isGradient = false }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const [offset, setOffset] = useState(circumference);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setOffset(circumference - (percentage / 100) * circumference);
        }, 500);
        return () => clearTimeout(timeout);
    }, [percentage, circumference]);

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90 drop-shadow-xl">
                {isGradient && (
                    <defs>
                        <linearGradient id="landingRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#4F46E5" />
                            <stop offset="50%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="#3B82F6" />
                        </linearGradient>
                    </defs>
                )}
                <circle 
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke="currentColor" strokeWidth={strokeWidth} fill="transparent"
                    className="text-gray-200 dark:text-white/10"
                />
                <circle 
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke={isGradient && percentage > 0 ? "url(#landingRingGradient)" : percentage > 0 ? "currentColor" : "transparent"} 
                    strokeWidth={strokeWidth} fill="transparent"
                    strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                    className={`transition-all duration-[2000ms] ease-out ${!isGradient ? 'text-blue-500' : ''}`}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-black text-foreground dark:text-slate-50" style={{ fontSize: size * 0.28 }}>
                <AnimatedCounter value={percentage} suffix="%" />
            </div>
        </div>
    );
};

// Motion Variants
const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// ==========================================
// Main Landing Page Component
// ==========================================
const LandingPage = () => {
    const navigate = useNavigate();
    const { token, logoutUser } = useContext(AuthContext);
    const { isDarkMode, toggleTheme } = useTheme();
    const isAuthenticated = !!token;
    
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Parallax logic for Hero floating elements
    const heroRef = useRef(null);
    const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const y1 = useTransform(heroScroll, [0, 1], [0, -150]);
    const y2 = useTransform(heroScroll, [0, 1], [0, 150]);
    const opacity = useTransform(heroScroll, [0, 0.8], [1, 0]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Platform', href: '#' },
        { name: 'Solutions', href: '#' },
        { name: 'Analytics', href: '#' },
        { name: 'Enterprise', href: '#' },
        { name: 'Security', href: '#' },
    ];

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <div className="min-h-screen bg-[#F6F8FD] dark:bg-[#07090D] text-foreground font-sans overflow-hidden selection:bg-indigo-500/30">
            
            {/* 1. Premium Fixed Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled ? 'bg-[#F6F8FD]/80 dark:bg-[#07090D]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 py-3 shadow-sm' : 'bg-transparent py-5'
            }`}>
                <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group transition-transform duration-300 hover:scale-[1.02] hover:opacity-90" onClick={scrollToTop}>
                        <img 
                            src="/skillstream-logo.png" 
                            alt="SkillStream Logo" 
                            className="w-8 h-8 object-contain" 
                        />
                        <span className="font-bold text-xl tracking-tight text-foreground dark:text-slate-50">
                            SkillStream<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500">.</span>
                        </span>
                    </div>

                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a 
                                key={link.name} 
                                href={link.href} 
                                className="!no-underline text-sm font-medium !text-gray-600 dark:!text-gray-300 transition-all duration-300 hover:!text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-indigo-500 hover:via-purple-500 hover:to-blue-500"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={toggleTheme} className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        
                        {isAuthenticated ? (
                            <>
                                <button onClick={() => navigate('/dashboard')} className="hidden sm:flex items-center gap-2 px-6 py-2.5 !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:opacity-90 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg dark:hover:shadow-indigo-500/20">
                                    Dashboard <ArrowRight className="w-4 h-4" />
                                </button>
                                <button onClick={() => logoutUser()} className="hidden sm:block text-sm font-medium !text-gray-600 dark:!text-gray-300 !no-underline transition-all duration-300 hover:!text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-indigo-500 hover:via-purple-500 hover:to-blue-500">
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => navigate('/login')} className="hidden sm:block text-sm font-medium !text-gray-600 dark:!text-gray-300 !no-underline transition-all duration-300 hover:!text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-indigo-500 hover:via-purple-500 hover:to-blue-500">
                                    Log In
                                </button>
                                <button onClick={() => navigate('/register')} className="hidden sm:flex items-center gap-2 px-6 py-2.5 !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:opacity-90 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg dark:hover:shadow-indigo-500/20">
                                    Get Started
                                </button>
                            </>
                        )}
                        <button className="lg:hidden p-2 text-gray-500 dark:text-slate-400" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-[#F6F8FD] dark:bg-[#07090D] flex flex-col p-6 lg:hidden"
                    >
                        <div className="flex justify-end mb-8">
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 dark:text-slate-400">
                                <X className="w-8 h-8" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-6 text-2xl font-bold">
                            {navLinks.map((link) => (
                                <a key={link.name} href={link.href} className="!no-underline text-foreground dark:text-slate-50 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-indigo-500 hover:to-blue-500">{link.name}</a>
                            ))}
                            <hr className="border-gray-200 dark:border-white/10 my-4" />
                            {isAuthenticated ? (
                                <>
                                    <button onClick={() => { setIsMobileMenuOpen(false); navigate('/dashboard'); }} className="text-left text-blue-500 !no-underline">Dashboard</button>
                                    <button onClick={() => { setIsMobileMenuOpen(false); logoutUser(); }} className="text-left text-red-500 !no-underline">Sign Out</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }} className="text-left text-foreground dark:text-slate-50 !no-underline">Log In</button>
                                    <button onClick={() => { setIsMobileMenuOpen(false); navigate('/register'); }} className="text-left text-blue-500 !no-underline">Get Started</button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. Hero Section (0 - 15% Scroll) */}
            <section ref={heroRef} className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 px-6 lg:px-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center min-h-[90vh]">
                {/* Enriched Background: Subtle Mesh Grid & Radial Glow */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute left-0 bottom-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
                
                <motion.div 
                    variants={staggerContainer} initial="hidden" animate="show"
                    className="flex-1 text-center lg:text-left z-10 relative"
                >
                    <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] text-foreground dark:text-slate-50">
                        Upskill your team <br className="hidden sm:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500">seamlessly.</span>
                    </motion.h1>
                    
                    <motion.p variants={fadeUp} className="text-lg sm:text-xl text-gray-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                        A high-fidelity corporate workspace built for rapid employee onboarding, modular training pipelines, and granular runtime progress synchronization tracking.
                    </motion.p>
                    
                    <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                        <button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')} className="w-full sm:w-auto px-10 py-4 !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:opacity-90 text-white font-bold text-lg transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2">
                            Get Started <ArrowRight className="w-5 h-5" />
                        </button>
                        <button onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto px-10 py-4 !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md bg-[#FFFFFF] dark:bg-[#11161F] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 text-foreground dark:text-slate-50 font-bold text-lg transition-colors flex items-center justify-center">
                            Explore the Platform
                        </button>
                    </motion.div>
                </motion.div>

                {/* Hero Floating Visuals (Parallax) - Fixed Overlap */}
                <motion.div style={{ opacity }} className="flex-1 relative h-[550px] w-full hidden lg:block perspective-[1000px] mt-10 lg:mt-0">
                    <motion.div style={{ y: y1 }} className="absolute right-0 top-0 w-72 bg-[#FFFFFF] dark:bg-[#11161F] p-6 rounded-[2rem] shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/10 rotate-y-[-10deg] rotate-x-[5deg] z-10">
                        <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-500/15 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-foreground dark:text-slate-50 mb-1">AWS Certified</h4>
                        <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Achieved 2 days ago</p>
                    </motion.div>

                    <motion.div style={{ y: y2 }} className="absolute left-0 bottom-0 w-64 bg-[#FFFFFF] dark:bg-[#11161F] p-6 rounded-[2rem] shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/10 rotate-y-[15deg] rotate-x-[-10deg] z-20 flex flex-col items-center">
                        <CircularProgress percentage={84} size={100} strokeWidth={8} isGradient={true} />
                        <p className="text-sm font-bold mt-4 text-foreground dark:text-slate-50">Global Completion</p>
                    </motion.div>

                    <motion.div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 p-6 rounded-[2rem] shadow-[0_0_50px_rgba(79,70,229,0.4)] text-white z-30 rotate-z-3 hover:rotate-z-0 transition-transform duration-500">
                        <h4 className="font-bold mb-2">Architecting APIs</h4>
                        <div className="w-full bg-white/20 rounded-full h-2 mb-2 overflow-hidden">
                            <div className="bg-white h-full w-[70%]" />
                        </div>
                        <p className="text-xs text-white/80 font-medium">Video paused at 12:44</p>
                    </motion.div>
                </motion.div>
            </section>

            {/* Feature Cards Grid */}
            <section id="features" className="py-24 px-6 lg:px-10 max-w-7xl mx-auto relative z-20">
                <motion.div 
                    initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {[
                        { icon: Zap, color: 'text-yellow-500 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-500/15', title: 'Smart Tracking', desc: 'Resumes individual video streams exactly where you left off.' },
                        { icon: Shield, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/15', title: 'Role Hierarchy', desc: 'Granular instructor workflows separated completely from employees.' },
                        { icon: BarChart3, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/15', title: 'Analytics Metrics', desc: 'Watch progress distributions and performance percentages.' },
                        { icon: Trophy, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/15', title: 'Gamified Badges', desc: 'Unlock unique achievement tracking badges as milestones are crushed.' }
                    ].map((feature, idx) => (
                        <motion.div key={idx} variants={fadeUp} whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)" }} className="bg-[#FFFFFF] dark:bg-[#11161F] p-8 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm dark:shadow-none transition-shadow group flex flex-col justify-between h-full">
                            <div>
                                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-foreground dark:text-slate-50 mb-3 leading-tight">{feature.title}</h3>
                            </div>
                            <p className="text-gray-500 dark:text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* 3. Smart Video / Learning Experience (15 - 35% Scroll) */}
            <section className="py-24 px-6 lg:px-10 bg-[#FFFFFF]/50 dark:bg-[#090C12]/50 border-y border-gray-200/50 dark:border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
                    <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="flex-1 lg:pr-12">
                        <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 text-foreground dark:text-slate-50 leading-[1.1]">
                            Learning that picks up where work leaves off.
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-lg text-gray-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
                            Smart tracking preserves individual learning progress seamlessly across devices. Whether on a desktop or a mobile phone, employees can continue their training exactly where they stopped.
                        </motion.p>
                        <motion.ul variants={staggerContainer} className="space-y-4">
                            {['Granular video progress tracking', 'Cross-device state synchronization', 'Distraction-free theater mode'].map((item, i) => (
                                <motion.li key={i} variants={fadeUp} className="flex items-center gap-3 text-foreground dark:text-slate-50 font-bold">
                                    <CheckCircle2 className="w-5 h-5 text-indigo-500" /> {item}
                                </motion.li>
                            ))}
                        </motion.ul>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} viewport={{ once: true, margin: "-100px" }} className="flex-1 w-full relative">
                        <div className="aspect-video bg-[#07090D] rounded-[2rem] overflow-hidden shadow-2xl relative border border-gray-800 dark:border-white/10 flex items-center justify-center group cursor-pointer">
                            <img 
                                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop" 
                                alt="Code Editor Interface" 
                                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center z-20 border border-white/20 group-hover:scale-110 transition-transform">
                                <PlayCircle className="w-10 h-10 text-white ml-1" />
                            </div>
                            <div className="absolute bottom-8 left-8 right-8 z-20">
                                <div className="flex justify-between items-end mb-3 text-white">
                                    <h4 className="font-bold text-lg drop-shadow-md">React Performance Patterns</h4>
                                    <span className="text-xs font-bold font-mono bg-black/50 px-2 py-1 rounded-md">12:44 / 28:00</span>
                                </div>
                                <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                                    <div className="bg-indigo-500 h-full w-[45%]" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 4. Course & Training Management (35 - 55% Scroll) */}
            <section className="py-32 px-6 lg:px-10 max-w-7xl mx-auto relative">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                <div className="flex flex-col lg:flex-row-reverse items-center gap-16 relative z-10">
                    <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="flex-1 lg:pl-12">
                        <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 text-foreground dark:text-slate-50 leading-[1.1]">
                            Training, structured for scale.
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-lg text-gray-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
                            Build modular training pipelines, organize learning paths, and manage enterprise education from one unified workspace. Scale your curriculum effortlessly.
                        </motion.p>
                        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 bg-[#FFFFFF] dark:bg-[#11161F] p-6 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm dark:shadow-none hover:-translate-y-1 transition-transform">
                                <Layers className="w-8 h-8 text-indigo-500 mb-3" />
                                <h4 className="font-bold text-foreground dark:text-slate-50 mb-1">Modular Paths</h4>
                                <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Group lessons logically.</p>
                            </div>
                            <div className="flex-1 bg-[#FFFFFF] dark:bg-[#11161F] p-6 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm dark:shadow-none hover:-translate-y-1 transition-transform">
                                <Target className="w-8 h-8 text-blue-500 mb-3" />
                                <h4 className="font-bold text-foreground dark:text-slate-50 mb-1">Goal Oriented</h4>
                                <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Assessments built-in.</p>
                            </div>
                        </motion.div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} viewport={{ once: true, margin: "-100px" }} className="flex-1 w-full grid grid-cols-2 gap-4">
                        {[
                            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=500&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=500&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=500&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=500&auto=format&fit=crop"
                        ].map((imgUrl, i) => (
                            <div key={i} className="bg-[#FFFFFF] dark:bg-[#11161F] p-6 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-md dark:shadow-none group overflow-hidden relative">
                                <div className="w-full h-32 bg-gray-100 dark:bg-[#151B26] rounded-xl mb-4 overflow-hidden relative">
                                    <img src={imgUrl} alt="Course Module Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                </div>
                                <div className="h-4 w-3/4 bg-gray-200 dark:bg-white/10 rounded-full mb-2" />
                                <div className="h-3 w-1/2 bg-gray-100 dark:bg-white/5 rounded-full" />
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* 5. Employee Progress & Analytics (55 - 70% Scroll) */}
            <section className="py-32 px-6 lg:px-10 bg-[#FFFFFF] dark:bg-[#090C12] border-y border-gray-200 dark:border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
                    <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="max-w-3xl mb-16">
                        <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 text-foreground dark:text-slate-50 leading-[1.1]">
                            Every milestone, measurable.
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-lg text-gray-500 dark:text-slate-400 font-medium leading-relaxed">
                            Turn learning activity into actionable performance insights with real-time progress, dynamic telemetry, and deep-dive analytics for managers.
                        </motion.p>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        <motion.div variants={fadeUp} whileHover={{ y: -4 }} className="bg-[#F6F8FD] dark:bg-[#11161F] p-10 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm dark:shadow-none flex flex-col items-center justify-center transition-transform">
                            <h6 className="uppercase tracking-widest text-xs font-bold text-gray-400 dark:text-slate-400 mb-6">Global Completion</h6>
                            <CircularProgress percentage={71} size={140} strokeWidth={12} isGradient={true} />
                        </motion.div>
                        
                        <motion.div variants={fadeUp} whileHover={{ y: -4 }} className="bg-[#F6F8FD] dark:bg-[#11161F] p-10 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm dark:shadow-none flex flex-col justify-center items-center transition-transform">
                            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-500 mb-6">
                                <Users className="w-8 h-8" />
                            </div>
                            <h6 className="uppercase tracking-widest text-xs font-bold text-gray-400 dark:text-slate-400 mb-2">Active Learners</h6>
                            <h2 className="text-5xl font-black text-foreground dark:text-slate-50">
                                <AnimatedCounter value={1248} />
                            </h2>
                        </motion.div>
                        
                        <motion.div variants={fadeUp} whileHover={{ y: -4 }} className="bg-[#F6F8FD] dark:bg-[#11161F] p-10 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm dark:shadow-none flex flex-col justify-center items-center transition-transform">
                            <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-500/15 flex items-center justify-center text-green-600 dark:text-green-500 mb-6">
                                <TrendingUp className="w-8 h-8" />
                            </div>
                            <h6 className="uppercase tracking-widest text-xs font-bold text-gray-400 dark:text-slate-400 mb-2">Avg Engagement</h6>
                            <h2 className="text-5xl font-black text-foreground dark:text-slate-50">
                                <AnimatedCounter value={94} suffix="%" />
                            </h2>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* 6. Instructor / Role Hierarchy (70 - 85% Scroll) */}
            <section className="py-32 px-6 lg:px-10 max-w-7xl mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none" />
                <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
                    <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="flex-1 lg:pr-12">
                        <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 text-foreground dark:text-slate-50 leading-[1.1]">
                            Powerful workflows.<br/>Clear roles.
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-lg text-gray-500 dark:text-slate-400 font-medium leading-relaxed">
                            Granular permissions keep instructors, administrators, and employees working seamlessly within the right level of access, ensuring data security and workflow efficiency.
                        </motion.p>
                    </motion.div>
                    
                    {/* Fixed Hierarchy Layout */}
                    <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="flex-1 w-full relative flex justify-center py-10">
                        <div className="flex flex-col gap-8 w-full max-w-sm relative pl-10">
                            {/* Vertical Line bypassing cards safely */}
                            <motion.div initial={{ height: 0 }} whileInView={{ height: '100%' }} transition={{ duration: 1.5, ease: "easeInOut" }} viewport={{ once: true }} className="absolute left-0 top-6 w-[3px] bg-gradient-to-b from-indigo-500 via-purple-500 to-blue-500 z-0 rounded-full" />
                            
                            <motion.div variants={fadeUp} className="bg-[#FFFFFF] dark:bg-[#11161F] p-5 rounded-[1.5rem] border border-indigo-500/30 shadow-lg dark:shadow-[0_10px_30px_rgba(79,70,229,0.1)] flex items-center gap-5 relative z-10 transition-transform hover:-translate-y-1">
                                <div className="absolute -left-[45px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20" />
                                <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white flex-shrink-0"><Shield className="w-6 h-6"/></div>
                                <div><h4 className="font-bold text-lg text-foreground dark:text-slate-50 leading-none mb-1">Administrator</h4><p className="text-sm font-medium text-gray-500 dark:text-slate-400">Full platform access</p></div>
                            </motion.div>
                            
                            <motion.div variants={fadeUp} className="bg-[#FFFFFF] dark:bg-[#151B26] p-5 rounded-[1.5rem] border border-gray-100 dark:border-white/10 shadow-sm flex items-center gap-5 relative z-10 transition-transform hover:-translate-y-1">
                                <div className="absolute -left-[45px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-purple-500/20" />
                                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white flex-shrink-0"><Users className="w-6 h-6"/></div>
                                <div><h4 className="font-bold text-lg text-foreground dark:text-slate-50 leading-none mb-1">Instructor</h4><p className="text-sm font-medium text-gray-500 dark:text-slate-400">Course & Analytics access</p></div>
                            </motion.div>
                            
                            <motion.div variants={fadeUp} className="bg-[#FFFFFF] dark:bg-[#151B26] p-5 rounded-[1.5rem] border border-gray-100 dark:border-white/10 shadow-sm flex items-center gap-5 relative z-10 transition-transform hover:-translate-y-1">
                                <div className="absolute -left-[45px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
                                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0"><Lock className="w-6 h-6"/></div>
                                <div><h4 className="font-bold text-lg text-foreground dark:text-slate-50 leading-none mb-1">Employee</h4><p className="text-sm font-medium text-gray-500 dark:text-slate-400">Learning workspace only</p></div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 7. Gamification & Achievements (85 - 95% Scroll) */}
            <section className="py-32 px-6 lg:px-10 bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#000000] text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20" />
                
                {/* Glowing Orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
                    <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="max-w-2xl mb-20">
                        <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                            Make progress <br className="hidden sm:block"/>worth celebrating.
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-xl text-white/70 font-medium leading-relaxed">
                            Give employees visible milestones, verifiable certificates, and meaningful achievements that turn routine learning into powerful momentum.
                        </motion.p>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl">
                        {[
                            { title: 'Fast Learner', icon: Zap, colors: 'from-yellow-400 to-orange-500', shadow: 'rgba(250,204,21,0.4)' },
                            { title: 'Perfect Score', icon: Target, colors: 'from-emerald-400 to-green-500', shadow: 'rgba(52,211,153,0.4)' },
                            { title: 'Consistent', icon: Calendar, colors: 'from-blue-400 to-indigo-500', shadow: 'rgba(96,165,250,0.4)' },
                            { title: 'Certified', icon: Award, colors: 'from-purple-400 to-pink-500', shadow: 'rgba(192,132,252,0.4)' }
                        ].map((badge, i) => (
                            <motion.div key={i} variants={fadeUp} whileHover={{ y: -10 }} className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 flex flex-col items-center justify-center h-full aspect-square shadow-[0_0_40px_rgba(255,255,255,0.02)] hover:shadow-[0_0_50px_rgba(255,255,255,0.1)] transition-all cursor-default group">
                                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${badge.colors} flex items-center justify-center mb-5 shadow-[0_0_30px_${badge.shadow}] group-hover:scale-110 transition-transform duration-500 flex-shrink-0`}>
                                    <badge.icon className="w-10 h-10 text-white" />
                                </div>
                                <h4 className="font-bold text-white text-base tracking-wide whitespace-nowrap">{badge.title}</h4>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* 8. Final CTA (95 - 100% Scroll) */}
            <section className="py-32 px-6 lg:px-10 text-center max-w-4xl mx-auto relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none" />
                <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="relative z-10">
                    <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-foreground dark:text-slate-50 leading-[1.1]">
                        Build a culture of <br/>continuous learning.
                    </motion.h2>
                    <motion.p variants={fadeUp} className="text-xl text-gray-500 dark:text-slate-400 font-medium leading-relaxed mb-10 max-w-2xl mx-auto">
                        SkillStream gives your organization the tools to train, measure, and grow exceptional teams efficiently.
                    </motion.p>
                    <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')} className="w-full sm:w-auto px-10 py-4 !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:opacity-90 text-white font-bold text-lg transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2">
                            Get Started Now <ArrowRight className="w-5 h-5" />
                        </button>
                    </motion.div>
                </motion.div>
            </section>

            {/* 9. Footer */}
            <footer className="border-t border-gray-200 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#07090D] py-12 px-6 lg:px-10 relative z-20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3 cursor-pointer group transition-transform duration-300 hover:scale-[1.02] hover:opacity-90" onClick={scrollToTop}>
                        <img 
                            src="/skillstream-logo.png" 
                            alt="SkillStream Logo" 
                            className="w-6 h-6 object-contain" 
                        />
                        <span className="font-bold text-lg tracking-tight text-foreground dark:text-slate-50">SkillStream.</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-slate-500 font-medium">
                        &copy; {new Date().getFullYear()} SkillStream Corporate LMS. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm font-medium">
                        <a href="#" className="!no-underline !text-gray-600 dark:!text-gray-300 transition-all duration-300 hover:!text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-indigo-500 hover:via-purple-500 hover:to-blue-500">Terms</a>
                        <a href="#" className="!no-underline !text-gray-600 dark:!text-gray-300 transition-all duration-300 hover:!text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-indigo-500 hover:via-purple-500 hover:to-blue-500">Privacy</a>
                        <a href="#" className="!no-underline !text-gray-600 dark:!text-gray-300 transition-all duration-300 hover:!text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-indigo-500 hover:via-purple-500 hover:to-blue-500">Security</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;