import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'motion/react';
import { Loader2, AlertCircle, CheckCircle2, GraduationCap, Briefcase } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'EMPLOYEE'
    });
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await api.post('/api/courses/register/', formData);
            navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#090C12] flex">
            {/* Left Side: Branding / Editorial (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 bg-black relative flex-col justify-between overflow-hidden">
                {/* Background Image / Gradient */}
                <div className="absolute inset-0 z-0 opacity-60 mix-blend-screen">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 to-transparent z-10" />
                    <img 
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                        alt="Students collaborating" 
                        className="w-full h-full object-cover"
                    />
                </div>
                
                {/* Content */}
                <div className="relative z-10 p-12 h-full flex flex-col justify-between">
                    <div>
                        <Link to="/">
                            <img 
                                src="/skillstream-logo-full.png" 
                                alt="SkillStream" 
                                className="h-10 brightness-0 invert opacity-90"
                            />
                        </Link>
                    </div>
                    
                    <div className="max-w-xl">
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-5xl font-extrabold text-white leading-tight mb-6"
                        >
                            Build skills that move businesses forward.
                        </motion.h1>
                        
                        <motion.ul 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-4 text-gray-300 text-lg"
                        >
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="w-6 h-6 text-indigo-400" />
                                Premium corporate learning tracks
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="w-6 h-6 text-indigo-400" />
                                Real-time progress analytics
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="w-6 h-6 text-indigo-400" />
                                Verifiable digital certifications
                            </li>
                        </motion.ul>
                    </div>
                    
                    <div className="text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} SkillStream Enterprise LMS
                    </div>
                </div>
            </div>

            {/* Right Side: Registration Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
                {/* Mobile Background Effect */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent -z-10 lg:hidden" />
                
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="text-center lg:text-left mb-8">
                        <div className="lg:hidden mb-8">
                            <Link to="/">
                                <img src="/skillstream-logo-full.png" alt="SkillStream Logo" className="h-12 mx-auto object-contain" />
                            </Link>
                        </div>
                        <h2 className="text-3xl font-extrabold text-foreground mb-2">Create an account</h2>
                        <p className="text-muted-foreground">Enter your details below to get started.</p>
                    </div>

                    <div className="bg-[#F6F8FD] dark:bg-[#11161F] p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-white/5 relative z-10">
                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-destructive font-medium">{error}</p>
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            
                            {/* Role Selection */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider">I am registering as an</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({...formData, role: 'EMPLOYEE'})}
                                        className={`flex flex-col items-center justify-center p-3 !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md border-2 transition-all ${
                                            formData.role === 'EMPLOYEE' 
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                                            : 'border-gray-200 dark:border-white/10 bg-transparent text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        <GraduationCap className="w-5 h-5 mb-1.5" />
                                        <span className="font-bold text-sm">Employee</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({...formData, role: 'INSTRUCTOR'})}
                                        className={`flex flex-col items-center justify-center p-3 !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md border-2 transition-all ${
                                            formData.role === 'INSTRUCTOR' 
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                                            : 'border-gray-200 dark:border-white/10 bg-transparent text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        <Briefcase className="w-5 h-5 mb-1.5" />
                                        <span className="font-bold text-sm">Instructor</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-2">Username</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-[#FFFFFF] dark:bg-[#151B26] border border-gray-200 dark:border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="Choose a username"
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-3 bg-[#FFFFFF] dark:bg-[#151B26] border border-gray-200 dark:border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="name@company.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-4 py-3 bg-[#FFFFFF] dark:bg-[#151B26] border border-gray-200 dark:border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="Create a secure password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:opacity-90 text-white !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md font-bold uppercase tracking-wider transition-all shadow-sm disabled:opacity-70 mt-6"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                {isLoading ? 'Creating Account...' : 'Register Now'}
                            </button>
                        </form>
                    </div>

                    <div className="mt-8 text-center">
                        <span className="text-muted-foreground text-sm">Already have an account? </span>
                        <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-bold text-sm transition-colors">
                            Sign In Here &rarr;
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;