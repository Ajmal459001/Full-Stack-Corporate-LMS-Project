import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'motion/react';
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

const Success = () => {
    const [searchParams] = useSearchParams();
    const courseId = searchParams.get('course_id');
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    
    const [status, setStatus] = useState('processing'); 
    const hasFetched = useRef(false); 

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const enrollUser = async () => {
            try {
                await api.post('/api/courses/checkout/success/', { course_id: courseId });
                setStatus('success');
                
                // Auto-redirect to workspace for a smoother UX presentation
                setTimeout(() => {
                    navigate('/dashboard');
                }, 3500);

            } catch (error) {
                console.error(error);
                setStatus('error');
            }
        };

        if (courseId) {
            enrollUser();
        } else {
            setStatus('error');
        }
    }, [courseId, navigate]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] opacity-20 -z-10 transition-colors duration-1000 ${
                status === 'success' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-primary'
            }`} />

            <div className="w-full max-w-md">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="glass-panel p-10 rounded-[2.5rem] shadow-2xl border border-border bg-card text-card-foreground text-center relative z-10"
                >
                    {status === 'processing' && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center"
                        >
                            <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
                            <h2 className="text-2xl font-extrabold text-foreground mb-3">Securing Workspace</h2>
                            <p className="text-muted-foreground">Please wait while we confirm your enrollment and set up your enterprise access.</p>
                        </motion.div>
                    )}

                    {status === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-6 relative">
                                <motion.div 
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
                                    className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" 
                                />
                                <CheckCircle2 className="w-12 h-12 text-green-500 relative z-10" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-foreground mb-3">Payment Successful!</h2>
                            <p className="text-muted-foreground mb-8">Your enrollment is confirmed. Redirecting you to your secure workspace momentarily...</p>
                            
                            <button 
                                onClick={() => navigate('/dashboard')}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-wider hover:bg-blue-600 transition-colors shadow-lg"
                            >
                                Enter Workspace Now <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                                <XCircle className="w-12 h-12 text-red-500" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-foreground mb-3">Verification Failed</h2>
                            <p className="text-muted-foreground mb-8">We could not securely verify your enrollment. If your card was charged, please contact IT support.</p>
                            
                            <button 
                                onClick={() => navigate('/catalog')}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-secondary text-foreground hover:bg-secondary/80 rounded-xl font-bold uppercase tracking-wider transition-colors border border-border"
                            >
                                Return to Catalog
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Success;