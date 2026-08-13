import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Award, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

const QuizExperience = ({ quiz, quizResult, onQuizSubmit, onRetry, onClaimCertificate, isSubmitting, isVIP }) => {
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

    const questions = quiz?.questions || [];
    const totalQuestions = questions.length;
    const progress = ((currentQuestionIdx + 1) / totalQuestions) * 100;
    const answeredCount = Object.keys(selectedAnswers).length;

    const handleAnswerSelect = (questionId, choiceId) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: choiceId
        }));
    };

    const handleNext = () => {
        if (currentQuestionIdx < totalQuestions - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIdx > 0) {
            setCurrentQuestionIdx(prev => prev - 1);
        }
    };

    const handleSubmit = () => {
        if (answeredCount < totalQuestions) {
            alert("Please answer all questions before submitting.");
            return;
        }
        onQuizSubmit(selectedAnswers);
    };

    // Results View
    if (quizResult) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-3xl mx-auto mt-12 bg-[#FFFFFF] dark:bg-[#11161F] backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-3xl p-10 shadow-2xl text-center"
            >
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, delay: 0.2 }}
                    className="w-32 h-32 mx-auto mb-8 relative flex items-center justify-center"
                >
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="64" cy="64" r="60" className="stroke-muted fill-none" strokeWidth="8" />
                        <motion.circle 
                            initial={{ strokeDashoffset: 377 }}
                            animate={{ strokeDashoffset: 377 - (377 * quizResult.score) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                            cx="64" cy="64" r="60" 
                            className={cn("fill-none", quizResult.passed ? "stroke-green-500" : "stroke-red-500")} 
                            strokeWidth="8" 
                            strokeDasharray="377" 
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className={cn("text-3xl font-black", quizResult.passed ? "text-green-500" : "text-red-500")}>
                        {quizResult.score}%
                    </span>
                </motion.div>

                <h2 className="text-3xl font-bold text-foreground mb-4">
                    {quizResult.passed ? 'Outstanding Work!' : 'Assessment Failed'}
                </h2>
                
                <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
                    {quizResult.message}
                </p>

                <div className="flex items-center justify-center gap-4">
                    {quizResult.passed ? (
                        <button 
                            onClick={onClaimCertificate}
                            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md font-bold text-lg hover:opacity-90 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                        >
                            <Award className="w-6 h-6" />
                            Claim Your Certificate
                        </button>
                    ) : (
                        <button 
                            onClick={onRetry}
                            className="flex items-center gap-2 px-8 py-4 bg-[#F6F8FD] dark:bg-[#151B26] text-foreground border border-gray-200 dark:border-white/10 rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                        >
                            <AlertCircle className="w-5 h-5" />
                            Retry Assessment
                        </button>
                    )}
                </div>
            </motion.div>
        );
    }

    if (totalQuestions === 0) {
        return (
            <div className="w-full flex flex-col items-center justify-center p-12 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-3xl mt-12 bg-[#F6F8FD] dark:bg-[#151B26]">
                <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">No Questions Available</h3>
                <p className="text-muted-foreground">The instructor has not added any questions to this assessment yet.</p>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIdx];

    return (
        <div className="w-full max-w-3xl mx-auto mt-8">
            {/* Quiz Header & Progress */}
            <div className="mb-10">
                <div className="flex items-end justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">{quiz.title}</h2>
                        <p className="text-muted-foreground text-sm">Pass mark: {quiz.passing_score}%</p>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                            Question {currentQuestionIdx + 1} of {totalQuestions}
                        </span>
                    </div>
                </div>
                
                <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden border border-gray-200 dark:border-white/10">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500"
                    />
                </div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-[#FFFFFF] dark:bg-[#11161F] backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-3xl p-8 shadow-xl"
                >
                    <h3 className="text-xl font-semibold text-foreground mb-8 leading-relaxed">
                        {currentQuestion.text}
                    </h3>

                    <div className="flex flex-col gap-3">
                        {currentQuestion.choices.map((choice) => {
                            const isSelected = selectedAnswers[currentQuestion.id] === choice.id;
                            
                            return (
                                <button
                                    key={choice.id}
                                    onClick={() => handleAnswerSelect(currentQuestion.id, choice.id)}
                                    className={cn(
                                        "w-full text-left p-5 rounded-xl border transition-all duration-200 flex items-center gap-4",
                                        isSelected 
                                            ? "border-indigo-500 bg-indigo-500/10 shadow-[0_4px_20px_rgba(99,102,241,0.15)]" 
                                            : "border-gray-200 dark:border-white/10 bg-[#F6F8FD] dark:bg-[#151B26] hover:bg-gray-100 dark:hover:bg-white/5"
                                    )}
                                >
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                        isSelected ? "border-indigo-500" : "border-muted-foreground"
                                    )}>
                                        {isSelected && <div className="w-3 h-3 bg-indigo-500 rounded-full" />}
                                    </div>
                                    <span className={cn(
                                        "text-base",
                                        isSelected ? "text-foreground font-semibold" : "text-muted-foreground"
                                    )}>
                                        {choice.text}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="mt-8 flex items-center justify-between">
                <button
                    onClick={handlePrev}
                    disabled={currentQuestionIdx === 0}
                    className="flex items-center gap-2 px-6 py-3 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:hover:text-muted-foreground transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> Previous
                </button>

                {currentQuestionIdx === totalQuestions - 1 ? (
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || answeredCount < totalQuestions}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)]"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Assessment'}
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-8 py-3 bg-[#F6F8FD] dark:bg-[#151B26] text-foreground border border-gray-200 dark:border-white/10 rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                    >
                        Next <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuizExperience;
