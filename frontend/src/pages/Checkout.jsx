import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'motion/react';
import { Loader2, ShieldCheck, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';

const Checkout = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    const [course, setCourse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await api.get(`/api/courses/${id}/`);
                setCourse(res.data);
            } catch (err) {
                console.error("Failed to fetch course details", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourse();
    }, [id]);

    const handleStripeCheckout = async () => {
        setIsProcessing(true);
        try {
            const res = await api.post(`/api/courses/checkout/create-session/${id}/`);
            window.location.href = res.data.checkout_url;
        } catch (err) {
            console.error("Failed to initiate Stripe session", err);
            setIsProcessing(false);
            alert("Payment gateway error. Please try again.");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#090C12] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-muted-foreground font-medium">Securing checkout session...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#090C12] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                    <ShieldCheck className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Checkout Error</h2>
                <p className="text-muted-foreground mb-6">Course not found or no longer available.</p>
                <button onClick={() => navigate('/catalog')} className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md font-bold hover:opacity-90 transition-colors">
                    Return to Catalog
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#090C12] py-12 px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => navigate('/catalog')}
                    className="w-fit flex items-center mb-3 gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:opacity-90 text-white !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md font-bold text-sm transition-all shadow-sm mb-8"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Catalog
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
                >
                    {/* Left: Course Summary */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xs font-bold uppercase tracking-wider mb-6">
                            <Lock className="w-3.5 h-3.5" /> Secure Enrollment
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-4">
                            You're almost there.
                        </h1>
                        <p className="text-lg text-muted-foreground mb-8">
                            Complete your enrollment to instantly unlock the premium workspace for this module.
                        </p>

                        <div className="p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm mb-8 bg-[#FFFFFF] dark:bg-[#11161F] text-foreground">
                            <div className="flex gap-4">
                                {course.thumbnail ? (
                                    <img src={course.thumbnail} alt={course.title} className="w-24 h-24 rounded-xl object-cover shadow-sm bg-black/10" />
                                ) : (
                                    <div className="w-24 h-24 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-xs">
                                        No Image
                                    </div>
                                )}
                                <div className="flex-1 flex flex-col justify-center">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{course.category}</span>
                                    <h3 className="text-lg font-bold text-foreground leading-tight">{course.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Instructor: {course.instructor_username}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold text-foreground mb-4 text-lg">What's included</h4>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                </div>
                                <span className="font-medium">Full workspace and curriculum access</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                </div>
                                <span className="font-medium">{course.validity_days} days of unlimited access</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                </div>
                                <span className="font-medium">Official verified completion certificate</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                </div>
                                <span className="font-medium">Direct instructor Q&A resources</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Checkout Summary */}
                    <div className="lg:pl-8 lg:border-l border-gray-200 dark:border-white/10">
                        <div className="p-8 rounded-3xl border border-gray-200 dark:border-white/5 bg-[#FFFFFF] dark:bg-[#11161F] text-foreground shadow-2xl sticky top-8">
                            <h3 className="text-2xl font-bold text-foreground mb-6">Order Summary</h3>

                            <div className="space-y-4 mb-6 text-sm font-medium">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Original Price</span>
                                    <span>${course.price}</span>
                                </div>
                                <div className="flex justify-between text-green-500">
                                    <span>Corporate Discount</span>
                                    <span>-$0.00</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground pb-4 border-b border-gray-200 dark:border-white/10">
                                    <span>Platform Fee</span>
                                    <span>Included</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-lg font-bold text-foreground">Total Today</span>
                                    <span className="text-4xl font-extrabold text-foreground">${course.price}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleStripeCheckout}
                                disabled={isProcessing}
                                className="w-full flex items-center justify-center gap-2 py-4 !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:opacity-90 text-white font-bold text-lg transition-all shadow-lg disabled:opacity-70 mb-4"
                            >
                                {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : null}
                                {isProcessing ? 'Processing Securely...' : 'Proceed to Payment'}
                            </button>

                            <div className="text-center text-xs text-muted-foreground font-medium flex items-center justify-center gap-1.5">
                                <Lock className="w-3.5 h-3.5" /> Secure, encrypted checkout via Stripe
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Checkout;