import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import {
    ArrowLeft, Image as ImageIcon, BookOpen, Target, Plus,
    Edit, Trash2, FileText, CheckCircle2, XCircle, Loader2, AlertCircle, PlayCircle
} from 'lucide-react';

const CourseManager = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    // Core States
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [activeTab, setActiveTab] = useState('curriculum');

    // Curriculum States
    const [newLesson, setNewLesson] = useState({ title: '', video_url: '', order: 1 });
    const [editingLessonId, setEditingLessonId] = useState(null);
    const [newResource, setNewResource] = useState({ title: '', file_url: '' });

    // Cloudinary Media Upload States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfTitle, setPdfTitle] = useState('');
    const [resourceFile, setResourceFile] = useState(null);

    // Assessment States
    const [questionText, setQuestionText] = useState('');
    const [choices, setChoices] = useState([
        { text: '', is_correct: true },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false }
    ]);

    useEffect(() => {
        fetchCourseData();
    }, [courseId]);

    const fetchCourseData = async () => {
        try {
            const courseRes = await api.get(`/api/courses/${courseId}/`);
            setCourse(courseRes.data);

            const rawLessons = courseRes.data.lessons || [];
            const sortedLessons = rawLessons.sort((a, b) => a.order - b.order);
            setLessons(sortedLessons);

            if (!editingLessonId) {
                setNewLesson(prev => ({ ...prev, order: sortedLessons.length + 1 }));
            }
        } catch (err) {
            setError("Failed to load course matrix. Ensure you have instructor permissions.");
        }
    };

    const uploadMediaToCloudinary = async (file) => {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            throw new Error("Cloudinary Environment Variables are missing!");
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, formData);
        return res.data.secure_url;
    };

    const handleAddOrUpdateLesson = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccessMsg('');
        setUploadStatus('Initializing upload...');

        try {
            let finalVideoUrl = newLesson.video_url;
            let finalPdfUrl = null;

            if (videoFile) {
                setUploadStatus('Uploading Video to Cloudinary (this may take a moment)...');
                finalVideoUrl = await uploadMediaToCloudinary(videoFile);
            } else if (!editingLessonId && !finalVideoUrl) {
                throw new Error("A video file is required to create a new lesson.");
            }

            if (pdfFile) {
                setUploadStatus('Uploading PDF Resource...');
                finalPdfUrl = await uploadMediaToCloudinary(pdfFile);
            }

            setUploadStatus('Saving to Database...');
            let savedLessonId = editingLessonId;

            if (editingLessonId) {
                await api.patch(`/api/courses/lessons/${editingLessonId}/`, { ...newLesson, video_url: finalVideoUrl });
                setSuccessMsg("Lesson updated successfully!");
            } else {
                const res = await api.post(`/api/courses/lessons/`, { course: courseId, ...newLesson, video_url: finalVideoUrl });
                savedLessonId = res.data.id;
                setSuccessMsg("New lesson added successfully!");
            }

            if (finalPdfUrl && pdfTitle) {
                await api.post(`/api/courses/resources/`, { lesson: savedLessonId, title: pdfTitle, file_url: finalPdfUrl });
            }

            handleCancelEdit();
            await fetchCourseData();

        } catch (err) {
            setError(err.message || "Failed to save lesson pipeline.");
        } finally {
            setIsSubmitting(false);
            setUploadStatus('');
        }
    };

    const handleEditClick = (lesson) => {
        setEditingLessonId(lesson.id);
        setNewLesson({ title: lesson.title, video_url: lesson.video_url, order: lesson.order });
        setVideoFile(null);
        setPdfFile(null);
        setPdfTitle('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingLessonId(null);
        setNewLesson({ title: '', video_url: '', order: lessons.length + 1 });
        setNewResource({ title: '', file_url: '' });
        setVideoFile(null);
        setPdfFile(null);
        setPdfTitle('');
        setResourceFile(null);
    };

    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm("Delete this video module?")) return;
        try {
            await api.delete(`/api/courses/lessons/${lessonId}/`);
            if (editingLessonId === lessonId) handleCancelEdit();
            fetchCourseData();
        } catch (err) { setError("Failed to delete lesson."); }
    };

    const handleAddResource = async () => {
        if (!newResource.title || (!newResource.file_url && !resourceFile)) {
            return setError("Resource title and file required.");
        }

        setIsSubmitting(true);
        setError('');
        setUploadStatus('Uploading Resource...');
        try {
            let finalFileUrl = newResource.file_url;
            if (resourceFile) {
                finalFileUrl = await uploadMediaToCloudinary(resourceFile);
            }

            await api.post(`/api/courses/resources/`, { lesson: editingLessonId, title: newResource.title, file_url: finalFileUrl });
            setNewResource({ title: '', file_url: '' });
            setResourceFile(null);
            fetchCourseData();
        } catch (err) {
            setError(err.message || "Failed to attach resource.");
        } finally {
            setIsSubmitting(false);
            setUploadStatus('');
        }
    };

    const handleDeleteResource = async (resourceId) => {
        try {
            await api.delete(`/api/courses/resources/${resourceId}/`);
            fetchCourseData();
        } catch (err) { setError("Failed to delete resource."); }
    };

    const handleCreateQuiz = async () => {
        try {
            await api.post('/api/courses/quizzes/', {
                course: courseId, title: 'Final Course Assessment', passing_score: 80
            });
            fetchCourseData();
        } catch (err) { setError("Failed to initialize assessment."); }
    };

    const handleSaveQuestion = async (e) => {
        e.preventDefault();
        if (!questionText || choices.some(c => !c.text)) return setError("Please fill out the question and all 4 choices.");

        setIsSubmitting(true);
        try {
            const qRes = await api.post('/api/courses/questions/', {
                quiz: course.quiz.id, text: questionText, order: course.quiz.questions ? course.quiz.questions.length + 1 : 1
            });

            await Promise.all(choices.map(c =>
                api.post('/api/courses/choices/', { question: qRes.data.id, ...c })
            ));

            setQuestionText('');
            setChoices([{ text: '', is_correct: true }, { text: '', is_correct: false }, { text: '', is_correct: false }, { text: '', is_correct: false }]);
            fetchCourseData();
        } catch (err) { setError("Failed to save question."); } finally { setIsSubmitting(false); }
    };

    const handleDeleteQuestion = async (qId) => {
        if (!window.confirm("Delete this question?")) return;
        try {
            await api.delete(`/api/courses/questions/${qId}/`);
            fetchCourseData();
        } catch (err) { setError("Failed to delete question."); }
    };

    if (!course) {
        return (
            <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#090C12] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-medium">Loading Course Matrix...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#090C12] py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Global Messages */}
                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3 justify-between">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-destructive font-medium">{error}</p>
                            </div>
                            <button onClick={() => setError('')} className="text-destructive/80 hover:text-destructive"><XCircle className="w-5 h-5" /></button>
                        </motion.div>
                    )}
                    {successMsg && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-3 justify-between">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-green-500 font-medium">{successMsg}</p>
                            </div>
                            <button onClick={() => setSuccessMsg('')} className="text-green-500/80 hover:text-green-500"><XCircle className="w-5 h-5" /></button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button onClick={() => navigate('/dashboard')} className="w-fit mb-3 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:opacity-90 text-white !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md font-bold text-sm transition-all shadow-sm mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Course Meta */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[#FFFFFF] dark:bg-[#11161F] rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden">
                            <div className="relative h-48 bg-black/50">
                                {course.thumbnail ? (
                                    <img src={course.thumbnail} className="w-full h-full object-cover" alt="Course Cover" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                                        <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                                        <span className="text-sm font-bold tracking-widest uppercase opacity-50">No Cover</span>
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-xs font-bold text-white shadow-xl">
                                        {course.category}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h4 className="text-xl font-extrabold text-foreground mb-2 leading-tight">{course.title}</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="bg-[#FFFFFF] dark:bg-[#11161F] p-2 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm flex flex-col">
                            <button
                                onClick={() => setActiveTab('curriculum')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'curriculum'
                                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white shadow-md'
                                    : 'text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5 hover:text-foreground'
                                    }`}
                            >
                                <BookOpen className="w-4 h-4" /> Curriculum Builder
                            </button>
                            <button
                                onClick={() => setActiveTab('assessment')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'assessment'
                                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white shadow-md'
                                    : 'text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5 hover:text-foreground'
                                    }`}
                            >
                                <Target className="w-4 h-4" /> Final Assessment
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Active Tab Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {activeTab === 'curriculum' ? (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key="curriculum">
                                {/* Lesson Builder Form */}
                                <div className="bg-[#FFFFFF] dark:bg-[#11161F] rounded-3xl border border-gray-200 dark:border-white/5 shadow-lg overflow-hidden mb-8">
                                    <div className="p-6 md:p-8 border-b border-gray-200 dark:border-white/5 bg-[#F6F8FD] dark:bg-[#07090D]">
                                        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                                            {editingLessonId ? <Edit className="w-6 h-6 text-yellow-500" /> : <Plus className="w-6 h-6 text-primary" />}
                                            {editingLessonId ? 'Update Video Module' : 'Attach Video Module'}
                                        </h2>
                                    </div>

                                    <div className="p-6 md:p-8">
                                        <form onSubmit={handleAddOrUpdateLesson} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-semibold text-foreground mb-2">Lesson Title</label>
                                                    <input type="text" required className="w-full bg-[#F6F8FD] dark:bg-[#151B26] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-foreground mb-2">Playback Order</label>
                                                    <input type="number" required min="1" className="w-full bg-[#F6F8FD] dark:bg-[#151B26] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={newLesson.order} onChange={e => setNewLesson({ ...newLesson, order: parseInt(e.target.value) })} />
                                                </div>
                                                <div className="md:col-span-3">
                                                    <label className="block text-sm font-semibold text-foreground mb-2">Video Module (MP4 / WebM)</label>
                                                    <div className="flex items-center gap-4 bg-[#F6F8FD] dark:bg-[#151B26] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 border-dashed">
                                                        <PlayCircle className="w-6 h-6 text-muted-foreground" />
                                                        <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files[0])} className="w-full text-sm text-foreground file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-500/10 file:text-indigo-500 hover:file:bg-indigo-500/20 cursor-pointer transition-colors" />
                                                    </div>
                                                    {editingLessonId && newLesson.video_url && (
                                                        <p className="text-xs text-muted-foreground mt-2 font-medium">A video is currently attached. Upload a new file to replace it.</p>
                                                    )}
                                                </div>
                                            </div>

                                            {!editingLessonId && (
                                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/5">
                                                    <h6 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
                                                        <FileText className="w-4 h-4 text-primary" /> Attach Document Resource (Optional)
                                                    </h6>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <input type="text" placeholder="Resource Title (e.g. Cheat Sheet)" className="w-full bg-[#F6F8FD] dark:bg-[#151B26] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-foreground text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={pdfTitle} onChange={e => setPdfTitle(e.target.value)} />
                                                        <input type="file" accept=".pdf,.zip,.doc,.docx" className="w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-500/10 file:text-indigo-500 hover:file:bg-indigo-500/20 cursor-pointer" onChange={e => setPdfFile(e.target.files[0])} />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200 dark:border-white/5">
                                                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:opacity-90 text-white !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md font-bold transition-all shadow-sm disabled:opacity-50">
                                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                                    {isSubmitting ? (uploadStatus || 'Processing...') : (editingLessonId ? 'Update Lesson' : 'Save Lesson Pipeline')}
                                                </button>
                                                {editingLessonId && (
                                                    <button type="button" onClick={handleCancelEdit} className="px-6 py-3 bg-[#F6F8FD] dark:bg-[#151B26] hover:bg-gray-100 dark:hover:bg-white/5 text-foreground border border-gray-200 dark:border-white/10 rounded-xl font-bold transition-all">
                                                        Cancel Edit
                                                    </button>
                                                )}
                                            </div>
                                        </form>

                                        {editingLessonId && (
                                            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/5">
                                                <h6 className="text-lg font-bold text-foreground mb-4">📁 Existing Resources</h6>

                                                <div className="space-y-3 mb-6">
                                                    {lessons.find(l => l.id === editingLessonId)?.resources?.map(r => (
                                                        <div key={r.id} className="flex items-center justify-between p-4 rounded-xl bg-[#F6F8FD] dark:bg-[#151B26] border border-gray-200 dark:border-white/10 shadow-sm">
                                                            <div className="flex items-center gap-3">
                                                                <FileText className="w-5 h-5 text-primary" />
                                                                <span className="text-sm font-semibold text-foreground">{r.title}</span>
                                                            </div>
                                                            <button onClick={() => handleDeleteResource(r.id)} className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-white transition-colors">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {lessons.find(l => l.id === editingLessonId)?.resources?.length === 0 && (
                                                        <p className="text-sm text-muted-foreground italic">No resources attached to this lesson.</p>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                                    <div className="md:col-span-4">
                                                        <input type="text" placeholder="Title (e.g. Starter.zip)" className="w-full bg-[#F6F8FD] dark:bg-[#151B26] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-foreground text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={newResource.title} onChange={e => setNewResource({ ...newResource, title: e.target.value })} />
                                                    </div>
                                                    <div className="md:col-span-5">
                                                        <input type="file" accept=".pdf,.zip,.doc,.docx" className="w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-500/10 file:text-indigo-500 hover:file:bg-indigo-500/20 cursor-pointer bg-[#F6F8FD] dark:bg-[#151B26] border border-gray-200 dark:border-white/10 rounded-xl px-2" onChange={e => setResourceFile(e.target.files[0])} />
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <button onClick={handleAddResource} disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F6F8FD] dark:bg-[#151B26] hover:bg-gray-100 dark:hover:bg-white/5 text-foreground border border-gray-200 dark:border-white/10 rounded-xl font-bold text-sm transition-all shadow-sm disabled:opacity-50">
                                                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Attach File'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Curriculum Track List */}
                                <h3 className="text-xl font-bold text-foreground mb-4">Current Curriculum Track</h3>
                                {lessons.length === 0 ? (
                                    <div className="text-center py-12 border border-dashed border-gray-200 dark:border-white/10 rounded-3xl bg-[#FFFFFF] dark:bg-[#11161F] shadow-sm">
                                        <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                        <p className="text-muted-foreground font-medium">This course shell is empty. Add your first video module above.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {lessons.map((lesson) => (
                                            <div
                                                key={lesson.id}
                                                onClick={() => handleEditClick(lesson)}
                                                className={`flex items-center justify-between p-4 md:p-5 rounded-2xl border transition-all cursor-pointer group ${editingLessonId === lesson.id
                                                    ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-500 shadow-sm'
                                                    : 'bg-[#FFFFFF] dark:bg-[#11161F] border-gray-200 dark:border-white/5 hover:border-indigo-500/50 shadow-sm hover:shadow-md'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-sm ${editingLessonId === lesson.id ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white' : 'bg-[#F6F8FD] dark:bg-[#151B26] text-foreground border border-gray-200 dark:border-white/10'
                                                        }`}>
                                                        {lesson.order}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h6 className="font-bold text-foreground text-base truncate flex items-center gap-2">
                                                            {lesson.title}
                                                            {lesson.resources?.length > 0 && (
                                                                <span className="bg-blue-500/10 text-blue-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                    <FileText className="w-3 h-3" /> {lesson.resources.length}
                                                                </span>
                                                            )}
                                                        </h6>
                                                        <p className="text-xs text-muted-foreground truncate mt-0.5 font-medium">{lesson.video_url}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson.id); }}
                                                    className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-white transition-colors ml-4 border border-transparent hover:border-destructive/50"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key="assessment">
                                {!course.quiz ? (
                                    <div className="p-12 text-center rounded-3xl border border-gray-200 dark:border-white/5 bg-[#FFFFFF] dark:bg-[#11161F] shadow-lg">
                                        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Target className="w-10 h-10 text-indigo-500" />
                                        </div>
                                        <h3 className="text-2xl font-extrabold text-foreground mb-3">No Final Assessment Active</h3>
                                        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Evaluate your students' knowledge with a final multiple-choice exam before allowing them to claim a certificate.</p>
                                        <button
                                            onClick={handleCreateQuiz}
                                            className="px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white hover:opacity-90 !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md font-bold uppercase tracking-wide transition-all shadow-lg mx-auto flex items-center gap-2"
                                        >
                                            <Target className="w-5 h-5" /> Enable Assessment Now
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-[#FFFFFF] dark:bg-[#11161F] rounded-3xl border border-gray-200 dark:border-white/5 shadow-lg overflow-hidden mb-8">
                                            <div className="p-6 md:p-8 border-b border-gray-200 dark:border-white/5 bg-[#F6F8FD] dark:bg-[#07090D] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                                                    <Plus className="w-6 h-6 text-indigo-500" /> Add a Question
                                                </h2>
                                                <span className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 text-foreground text-xs font-bold rounded-full border border-gray-200 dark:border-white/10 uppercase tracking-widest shadow-sm">
                                                    Passing Score: {course.quiz.passing_score}%
                                                </span>
                                            </div>
                                            <div className="p-6 md:p-8">
                                                <form onSubmit={handleSaveQuestion}>
                                                    <div className="mb-6">
                                                        <label className="block text-sm font-semibold text-foreground mb-2">Question Prompt</label>
                                                        <input
                                                            type="text" required
                                                            className="w-full bg-[#F6F8FD] dark:bg-[#151B26] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                            value={questionText}
                                                            onChange={e => setQuestionText(e.target.value)}
                                                            placeholder="e.g., What is the primary purpose of the React Virtual DOM?"
                                                        />
                                                    </div>

                                                    <label className="block text-sm font-semibold text-foreground mb-3">Multiple Choice Options (Select the correct answer via the radio button)</label>
                                                    <div className="space-y-3 mb-8">
                                                        {choices.map((choice, index) => (
                                                            <div key={index} className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${choice.is_correct ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-500 shadow-sm' : 'bg-[#F6F8FD] dark:bg-[#151B26] border-gray-200 dark:border-white/10'
                                                                }`}>
                                                                <div className="pl-3 flex items-center h-full">
                                                                    <input
                                                                        type="radio"
                                                                        name="correctChoice"
                                                                        checked={choice.is_correct}
                                                                        onChange={() => {
                                                                            const newChoices = choices.map((c, i) => ({ ...c, is_correct: i === index }));
                                                                            setChoices(newChoices);
                                                                        }}
                                                                        className="w-5 h-5 accent-indigo-500 cursor-pointer"
                                                                    />
                                                                </div>
                                                                <input
                                                                    type="text" required
                                                                    placeholder={`Option ${index + 1}`}
                                                                    className="w-full bg-transparent border-none text-foreground focus:ring-0 outline-none py-2 px-1 text-sm font-medium"
                                                                    value={choice.text}
                                                                    onChange={e => {
                                                                        const newChoices = [...choices];
                                                                        newChoices[index].text = e.target.value;
                                                                        setChoices(newChoices);
                                                                    }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:opacity-90 text-white !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md font-bold transition-all shadow-md disabled:opacity-50">
                                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                                        {isSubmitting ? 'Saving to Database...' : 'Save Question to Bank'}
                                                    </button>
                                                </form>
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-foreground mb-4">Question Bank ({course.quiz.questions?.length || 0})</h3>
                                        {(!course.quiz.questions || course.quiz.questions.length === 0) ? (
                                            <div className="text-center py-12 border border-dashed border-gray-200 dark:border-white/10 rounded-3xl bg-[#FFFFFF] dark:bg-[#11161F] shadow-sm">
                                                <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                                <p className="text-muted-foreground font-medium">No questions have been added to the test bank yet.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {course.quiz.questions.map((q, idx) => (
                                                    <div key={q.id} className="p-6 rounded-2xl border border-gray-200 dark:border-white/5 bg-[#FFFFFF] dark:bg-[#11161F] shadow-sm relative group">
                                                        <div className="pr-12 mb-4">
                                                            <h4 className="text-lg font-extrabold text-foreground leading-snug">
                                                                <span className="text-indigo-500 mr-2">{idx + 1}.</span> {q.text}
                                                            </h4>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteQuestion(q.id)}
                                                            className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-white transition-colors border border-transparent hover:border-destructive/50"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>

                                                        <div className="space-y-2 pl-6 sm:pl-8 border-l-2 border-border/50">
                                                            {q.choices.map((c) => (
                                                                <div key={c.id} className={`flex items-start gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${c.is_correct ? 'bg-green-500/10 text-green-600 dark:text-green-500 font-bold' : 'text-muted-foreground'
                                                                    }`}>
                                                                    <div className="mt-0.5 flex-shrink-0">
                                                                        {c.is_correct ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4 opacity-40" />}
                                                                    </div>
                                                                    <span>{c.text}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseManager;