// frontend/src/pages/CourseWorkspace.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, Star, FileText, CheckCircle2, Lock, MonitorPlay, Award, ArrowRight, LayoutDashboard, Search } from 'lucide-react';
import api from '../api';
import { cn } from '../lib/utils';
import VideoPlayer from '../components/workspace/VideoPlayer';
import QuizExperience from '../components/workspace/QuizExperience';

const CourseWorkspace = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    // Core States
    const [course, setCourse] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({ percentage: 0, completed_lessons: [] });
    const [isVIP, setIsVIP] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Review Modal States (Using custom modal now)
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState('');

    // Assessment States
    const [activeQuizMode, setActiveQuizMode] = useState(false);
    const [quizResult, setQuizResult] = useState(null);

    const initialTimeRef = useRef(0);
    const isNavigatingRef = useRef(false);
    const lastSavedTimeRef = useRef(-1);

    const fetchWorkspaceData = async (targetLessonId = null) => {
        setIsLoading(true);
        try {
            const userRes = await api.get('/api/auth/user/');
            const role = userRes.data.role?.toUpperCase() || 'EMPLOYEE';
            const hasVIPAccess = role === 'ADMIN' || role === 'INSTRUCTOR';
            setIsVIP(hasVIPAccess);

            const courseRes = await api.get(`/api/courses/${courseId}/`);
            const fetchedCourse = courseRes.data;

            const sortedLessons = (fetchedCourse.lessons || []).sort((a, b) => a.order - b.order);
            fetchedCourse.lessons = sortedLessons;
            setCourse(fetchedCourse);

            if (targetLessonId === 'quiz') {
                setActiveLesson(null);
                setActiveQuizMode(true);
                setIsLoading(false);
                return;
            }

            if (sortedLessons.length > 0 && !activeQuizMode) {
                let lessonToPlay = targetLessonId
                    ? sortedLessons.find(l => l.id === targetLessonId)
                    : sortedLessons[0];
                let startTime = 0.0;

                if (!hasVIPAccess) {
                    try {
                        const url = targetLessonId
                            ? `/api/courses/progress/${courseId}/?lesson_id=${targetLessonId}`
                            : `/api/courses/progress/${courseId}/`;

                        const progressRes = await api.get(url);
                        const statsRes = await api.get(`/api/courses/stats/${courseId}/`);
                        setStats(statsRes.data);

                        if (statsRes.data.quiz_passed || statsRes.data.best_score > 0) {
                            setQuizResult({
                                passed: statsRes.data.quiz_passed,
                                score: statsRes.data.best_score,
                                message: statsRes.data.quiz_passed ? "You have successfully completed this assessment." : "Your previous attempt did not meet the passing criteria."
                            });
                        }

                        if (!targetLessonId && progressRes.data.last_watched_lesson) {
                            lessonToPlay = sortedLessons.find(l => l.id === progressRes.data.last_watched_lesson) || sortedLessons[0];
                        }
                        startTime = parseFloat(progressRes.data.last_timestamp) || 0.0;
                    } catch (e) {
                        console.error("Progress fetch failed.", e);
                    }
                }

                initialTimeRef.current = startTime;
                lastSavedTimeRef.current = -1;
                setActiveLesson(lessonToPlay);
                setActiveQuizMode(false);
            }
        } catch (err) {
            setError("Could not load course workspace data matrix.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkspaceData();
    }, [courseId]);

    const saveProgress = async (lessonId, timestamp, isCompleted = false) => {
        if (isVIP || !lessonId || timestamp === undefined || isNaN(timestamp)) return;
        if (timestamp === lastSavedTimeRef.current && !isCompleted) return;

        lastSavedTimeRef.current = timestamp;

        try {
            await api.post(`/api/courses/progress/${courseId}/`, {
                lesson_id: lessonId,
                timestamp: timestamp,
                is_completed: isCompleted
            });

            if (!isNavigatingRef.current) {
                const statsRes = await api.get(`/api/courses/stats/${courseId}/`);
                setStats(statsRes.data);

                // If it was completed, automatically unlock next step (handled via stats update)
            }
        } catch (err) {
            console.error("Failed to sync progress.", err);
        }
    };

    const handleBackToDashboard = async () => {
        isNavigatingRef.current = true;
        navigate('/dashboard');
    };

    const handleLessonClick = async (lesson) => {
        if (activeLesson?.id === lesson.id) return;
        isNavigatingRef.current = true;
        setActiveLesson(null);
        setActiveQuizMode(false);
        await fetchWorkspaceData(lesson.id);
        isNavigatingRef.current = false;
    };

    const handleSubmitReview = async () => {
        setReviewSubmitting(true);
        setError('');
        setReviewSuccess('');
        try {
            await api.post(`/api/courses/course/${courseId}/review/`, reviewData);
            setReviewSuccess('Review submitted successfully!');
            setTimeout(() => {
                setShowReviewModal(false);
                setReviewSuccess('');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to submit review.");
        } finally {
            setReviewSubmitting(false);
        }
    };

    const handleQuizSubmission = async (answers) => {
        try {
            const res = await api.post(`/api/courses/quiz/${course.quiz.id}/submit/`, { answers });
            setQuizResult(res.data);
            const statsRes = await api.get(`/api/courses/stats/${courseId}/`);
            setStats(statsRes.data);
        } catch (err) {
            alert("Failed to evaluate quiz.");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
                <h2 className="text-xl font-semibold text-foreground">Loading Secure Workspace...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="bg-red-500/10 text-red-500 px-6 py-4 rounded-2xl border border-red-500/20 max-w-md text-center">
                    <p className="font-bold">{error}</p>
                    <button onClick={() => navigate('/dashboard')} className="mt-4 px-6 py-2 bg-red-500 text-white rounded-xl font-semibold">Return to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#090C12] flex flex-col">
            {/* Top Navigation */}
            <header className="sticky top-0 z-40 bg-[#FFFFFF]/80 dark:bg-[#090C12]/80 backdrop-blur-2xl border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBackToDashboard}
                        className="w-fit flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:opacity-90 text-white !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md font-bold text-sm transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-foreground leading-tight flex items-center gap-2">
                            {course?.title}
                            {isVIP && <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-600 border border-amber-500/20 uppercase tracking-wider">Instructor View</span>}
                        </h1>
                        <p className="text-xs text-muted-foreground font-medium">Instructor: {course?.instructor_username}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {!isVIP && (
                        <div className="hidden md:flex items-center gap-3">
                            <div className="w-32 h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden border border-gray-200 dark:border-white/10">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stats.percentage}%` }}
                                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500"
                                />
                            </div>
                            <span className="text-sm font-bold text-foreground">{stats.percentage}%</span>
                        </div>
                    )}

                    {!isVIP && (
                        <button
                            onClick={() => setShowReviewModal(true)}
                            className="flex items-center gap-2 px-4 py-2 !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md bg-[#F6F8FD] dark:bg-[#151B26] text-foreground border border-gray-200 dark:border-white/10 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-white/5 transition-colors shadow-sm"
                        >
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            Review
                        </button>
                    )}

                    {!isVIP && stats.percentage === 100 && (!course?.quiz || quizResult?.passed) && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(`/certificate/${courseId}`)}
                            className="flex items-center gap-2 px-5 py-2 !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md bg-green-500 hover:bg-green-600 text-white font-bold shadow-[0_4px_14px_0_rgba(34,197,94,0.39)] transition-all"
                        >
                            <Award className="w-4 h-4" />
                            Certificate
                        </motion.button>
                    )}
                </div>
            </header>

            {/* Main Workspace */}
            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left Content Area (Video / Quiz) */}
                <div className="flex-1 overflow-y-auto bg-[#F6F8FD] dark:bg-[#07090D] p-4 lg:p-8">
                    <div className="max-w-5xl mx-auto">

                        {activeQuizMode ? (
                            !isVIP && stats.percentage < 100 ? (
                                <div className="flex flex-col items-center justify-center h-96 text-center">
                                    <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
                                        <Lock className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-foreground mb-4">Assessment Locked</h2>
                                    <p className="text-muted-foreground text-lg mb-8 max-w-md">
                                        You must complete all lessons in this course before taking the final assessment.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setActiveQuizMode(false);
                                            setActiveLesson(course.lessons[0]);
                                        }}
                                        className="px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md font-bold text-lg hover:opacity-90 transition-all shadow-md"
                                    >
                                        Return to Course
                                    </button>
                                </div>
                            ) : (
                                <QuizExperience
                                    quiz={course.quiz}
                                    quizResult={quizResult}
                                    onQuizSubmit={handleQuizSubmission}
                                    onRetry={() => setQuizResult(null)}
                                    onClaimCertificate={() => navigate(`/certificate/${courseId}`)}
                                    isVIP={isVIP}
                                />
                            )
                        ) : activeLesson ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full"
                            >
                                <VideoPlayer
                                    activeLesson={activeLesson}
                                    initialTime={initialTimeRef.current}
                                    isVIP={isVIP}
                                    onTimeUpdate={(time) => saveProgress(activeLesson.id, time, false)}
                                    onProgressUpdate={(time) => saveProgress(activeLesson.id, time, false)}
                                    onEnded={() => saveProgress(activeLesson.id, 0.0, true)}
                                />

                                <div className="mt-8 bg-[#FFFFFF] dark:bg-[#11161F] text-foreground rounded-3xl p-8 border border-gray-200 dark:border-white/5 shadow-xl">
                                    <h2 className="text-3xl font-bold text-foreground mb-4">{activeLesson.title}</h2>
                                    <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground mb-8">
                                        <p>{activeLesson.description || "No description provided for this lesson."}</p>
                                    </div>

                                    {activeLesson.resources && activeLesson.resources.length > 0 && (
                                        <div className="pt-8 border-t border-gray-200 dark:border-white/10">
                                            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                                <FileText className="w-5 h-5 text-indigo-500" />
                                                Resources
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {activeLesson.resources.map(res => (
                                                    <a
                                                        key={res.id}
                                                        href={res.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 p-4 rounded-xl bg-[#F6F8FD] dark:bg-[#151B26] border border-gray-200 dark:border-white/10 hover:border-indigo-500/50 transition-all shadow-sm group"
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                                                            <FileText className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1 truncate">
                                                            <p className="font-semibold text-foreground text-sm truncate">{res.title}</p>
                                                            <p className="text-xs text-muted-foreground">Download Resource</p>
                                                        </div>
                                                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : null}

                    </div>
                </div>

                {/* Right Curriculum Sidebar */}
                <aside className="w-full lg:w-96 bg-[#FFFFFF] dark:bg-[#11161F] text-foreground border-l border-gray-200 dark:border-white/5 overflow-y-auto flex-shrink-0">
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                            <LayoutDashboard className="w-5 h-5 text-indigo-500" />
                            Curriculum
                        </h3>

                        <div className="space-y-3">
                            {course?.lessons.map((lesson, idx) => {
                                const isCompleted = !isVIP && stats.completed_lessons.includes(lesson.id);
                                const isActive = !activeQuizMode && activeLesson?.id === lesson.id;

                                return (
                                    <button
                                        key={lesson.id}
                                        onClick={() => handleLessonClick(lesson)}
                                        className={cn(
                                            "w-full text-left p-4 rounded-2xl transition-all duration-200 border flex items-center gap-4",
                                            isActive
                                                ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white border-transparent shadow-[0_4px_20px_rgba(79,70,229,0.3)]"
                                                : "bg-[#F6F8FD] dark:bg-[#151B26] hover:border-indigo-500/50 border-gray-200 dark:border-white/10"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                            isActive ? "bg-white/20 text-white" : isCompleted ? "bg-green-500/10 text-green-500" : "bg-gray-200 dark:bg-white/5 text-muted-foreground"
                                        )}>
                                            {isCompleted && !isActive ? <CheckCircle2 className="w-5 h-5" /> : <MonitorPlay className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 truncate">
                                            <p className={cn("text-sm font-semibold truncate", isActive ? "text-white" : "text-foreground")}>
                                                {idx + 1}. {lesson.title}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}

                            {course?.quiz && (() => {
                                const isLocked = !isVIP && stats.percentage < 100;
                                return (
                                    <button
                                        disabled={isLocked}
                                        onClick={() => {
                                            setActiveLesson(null);
                                            setActiveQuizMode(true);
                                        }}
                                        className={cn(
                                            "w-full text-left p-4 rounded-2xl transition-all duration-200 border-2 flex items-center gap-4 mt-6",
                                            activeQuizMode
                                                ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white border-transparent shadow-[0_4px_20px_rgba(79,70,229,0.3)]"
                                                : isLocked
                                                    ? "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 opacity-70 cursor-not-allowed"
                                                    : "bg-[#F6F8FD] dark:bg-[#151B26] hover:border-indigo-500/50 border-indigo-500/30 border-dashed"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                            activeQuizMode ? "bg-white/20 text-white" : isLocked ? "bg-gray-200 dark:bg-white/10 text-muted-foreground" : "bg-indigo-500/10 text-indigo-500"
                                        )}>
                                            {isLocked ? <Lock className="w-4 h-4" /> : quizResult?.passed ? <Award className="w-5 h-5 text-green-500" /> : <Star className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className={cn("text-sm font-semibold", activeQuizMode ? "text-white" : "text-foreground")}>
                                                Final Assessment
                                            </p>
                                            <p className={cn("text-xs font-medium mt-0.5", activeQuizMode ? "text-white/80" : isLocked ? "text-muted-foreground" : "text-indigo-500")}>
                                                {isLocked ? 'Complete all lessons to unlock' : quizResult?.passed ? 'Passed - Claim Certificate' : quizResult ? 'Failed - Retry Available' : 'Ready to begin'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })()}
                        </div>
                    </div>
                </aside>
            </main>

            {/* Review Modal Custom */}
            <AnimatePresence>
                {showReviewModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#FFFFFF] dark:bg-[#11161F] border border-gray-200 dark:border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
                        >
                            <h2 className="text-2xl font-bold text-foreground mb-6">Rate this Course</h2>

                            {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-500/10 rounded-xl">{error}</div>}
                            {reviewSuccess && <div className="p-3 mb-4 text-sm text-green-500 bg-green-500/10 rounded-xl">{reviewSuccess}</div>}

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-2">Overall Rating</label>
                                    <select
                                        value={reviewData.rating}
                                        onChange={e => setReviewData({ ...reviewData, rating: e.target.value })}
                                        className="w-full bg-[#F6F8FD] dark:bg-[#151B26] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground outline-none focus:border-indigo-500 transition-colors"
                                    >
                                        <option value="5">⭐⭐⭐⭐⭐ (5/5) Excellent</option>
                                        <option value="4">⭐⭐⭐⭐ (4/5) Very Good</option>
                                        <option value="3">⭐⭐⭐ (3/5) Average</option>
                                        <option value="2">⭐⭐ (2/5) Poor</option>
                                        <option value="1">⭐ (1/5) Terrible</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-2">Written Review (Optional)</label>
                                    <textarea
                                        rows={3}
                                        value={reviewData.comment}
                                        onChange={e => setReviewData({ ...reviewData, comment: e.target.value })}
                                        placeholder="What did you think of the course content?"
                                        className="w-full bg-[#F6F8FD] dark:bg-[#151B26] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground outline-none focus:border-indigo-500 transition-colors resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowReviewModal(false)}
                                        className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-white/10 text-foreground font-semibold hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmitReview}
                                        disabled={reviewSubmitting}
                                        className="flex-1 py-3 px-4 !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white font-bold shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:opacity-90 transition-all disabled:opacity-50"
                                    >
                                        {reviewSubmitting ? 'Submitting...' : 'Submit'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CourseWorkspace;
