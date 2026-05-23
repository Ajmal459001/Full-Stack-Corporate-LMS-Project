// frontend/src/pages/CourseWorkspace.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, ListGroup, Card, Button, Alert, ProgressBar, Badge, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const CourseWorkspace = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    
    // Core States
    const [course, setCourse] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({ percentage: 0, completed_lessons: [] });
    const [isVIP, setIsVIP] = useState(false); 

    // Review Modal States
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState('');

    // Assessment States
    const [activeQuizMode, setActiveQuizMode] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState({}); 
    const [quizResult, setQuizResult] = useState(null);
    const [quizSubmitting, setQuizSubmitting] = useState(false);

    const videoRef = useRef(null);
    const initialTimeRef = useRef(0);
    const lastTrackedTimeRef = useRef(0);
    const isNavigatingRef = useRef(false);
    const lastSavedTimeRef = useRef(-1);
    const hasSeekedRef = useRef(false); 

    const fetchWorkspaceData = async (targetLessonId = null) => {
        try {
            const token = localStorage.getItem('access_token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const userRes = await axios.get('http://127.0.0.1:8000/api/auth/user/', config);
            const role = userRes.data.role?.toUpperCase() || 'EMPLOYEE';
            const hasVIPAccess = role === 'ADMIN' || role === 'INSTRUCTOR';
            setIsVIP(hasVIPAccess);

            const courseRes = await axios.get(`http://127.0.0.1:8000/api/courses/${courseId}/`, config);
            const fetchedCourse = courseRes.data;
            
            const sortedLessons = (fetchedCourse.lessons || []).sort((a, b) => a.order - b.order);
            fetchedCourse.lessons = sortedLessons;
            setCourse(fetchedCourse);

            if (targetLessonId === 'quiz') {
                setActiveLesson(null);
                setActiveQuizMode(true);
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
                            ? `http://127.0.0.1:8000/api/courses/progress/${courseId}/?lesson_id=${targetLessonId}`
                            : `http://127.0.0.1:8000/api/courses/progress/${courseId}/`;
                            
                        const progressRes = await axios.get(url, config);
                        const statsRes = await axios.get(`http://127.0.0.1:8000/api/courses/stats/${courseId}/`, config);
                        setStats(statsRes.data);
                        
                        // SPRINT 2 FIX: Automatically populate quizResult if they passed previously!
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
                lastTrackedTimeRef.current = startTime;
                lastSavedTimeRef.current = -1;
                hasSeekedRef.current = false; 
                setActiveLesson(lessonToPlay);
                setActiveQuizMode(false);
            }
        } catch (err) {
            setError("Could not load course workspace data matrix.");
        }
    };

    useEffect(() => {
        fetchWorkspaceData();
    }, [courseId]);

    const handleCanPlay = () => {
        if (videoRef.current && !hasSeekedRef.current && !isVIP) {
            videoRef.current.currentTime = initialTimeRef.current;
            hasSeekedRef.current = true; 
        }
    };

    const saveProgress = async (lessonId, timestamp, isCompleted = false) => {
        if (isVIP || !lessonId || timestamp === undefined || isNaN(timestamp)) return;
        if (timestamp === lastSavedTimeRef.current && !isCompleted) return;
        
        lastSavedTimeRef.current = timestamp; 
        const token = localStorage.getItem('access_token');

        try {
            await axios.post(`http://127.0.0.1:8000/api/courses/progress/${courseId}/`, {
                lesson_id: lessonId,
                timestamp: timestamp,
                is_completed: isCompleted 
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            if (!isNavigatingRef.current) {
                const statsRes = await axios.get(`http://127.0.0.1:8000/api/courses/stats/${courseId}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(statsRes.data);
            }
        } catch (err) {
            console.error("Failed to sync progress.", err);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current && !videoRef.current.ended) {
            if (isVIP || hasSeekedRef.current) {
                if (videoRef.current.currentTime > 0) {
                    lastTrackedTimeRef.current = videoRef.current.currentTime;
                }
            }
        }
    };

    const handlePause = () => {
        if (isNavigatingRef.current || isVIP) return; 
        if (activeLesson && lastTrackedTimeRef.current > 0) {
            saveProgress(activeLesson.id, lastTrackedTimeRef.current);
        }
    };

    const handleBackToDashboard = async () => {
        isNavigatingRef.current = true; 
        if (videoRef.current) videoRef.current.pause(); 
        
        if (!isVIP && activeLesson && lastTrackedTimeRef.current > 0) {
            await saveProgress(activeLesson.id, lastTrackedTimeRef.current);
        }
        navigate('/dashboard');
    };

    const handleLessonClick = async (lesson) => {
        if (activeLesson?.id === lesson.id) return;
        
        isNavigatingRef.current = true; 
        if (videoRef.current) videoRef.current.pause();
        
        if (!isVIP && lastTrackedTimeRef.current > 0) {
            await saveProgress(activeLesson.id, lastTrackedTimeRef.current);
        }
        
        setActiveLesson(null);
        setActiveQuizMode(false);
        // Do not wipe quizResult here so the badge stays active!
        setSelectedAnswers({});
        await fetchWorkspaceData(lesson.id);
        isNavigatingRef.current = false; 
    };

    const handleSubmitReview = async () => {
        setReviewSubmitting(true);
        setError('');
        setReviewSuccess('');
        try {
            const token = localStorage.getItem('access_token');
            await axios.post(`http://127.0.0.1:8000/api/courses/course/${courseId}/review/`, reviewData, {
                headers: { Authorization: `Bearer ${token}` }
            });
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

    const handleQuizSubmission = async (e) => {
        e.preventDefault();
        if (Object.keys(selectedAnswers).length < course.quiz.questions.length) {
            return alert("Please answer all questions before submitting your evaluation.");
        }
        
        setQuizSubmitting(true);
        setError('');
        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.post(`http://127.0.0.1:8000/api/courses/quiz/${course.quiz.id}/submit/`, {
                answers: selectedAnswers
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            setQuizResult(res.data);
        } catch(err) {
            setError("Failed to verify quiz parameters via server endpoints.");
        } finally {
            setQuizSubmitting(false);
        }
    };

    if (error && !showReviewModal && !activeQuizMode) return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
    if (!course) return <Container className="mt-4">Loading training workspace...</Container>;

    return (
        <Container fluid className="mt-4 px-4 fade-in-up">
            <Button variant="outline-secondary" size="sm" className="mb-3 rounded-pill" onClick={handleBackToDashboard}>
                &larr; Back to Dashboard
            </Button>
            
            <div className="d-flex justify-content-between align-items-end mb-4">
                <div>
                    <h3 className={`mb-1 fw-bold ${isDarkMode ? 'text-light' : 'text-dark'}`}>{course.title} {isVIP && <Badge bg="warning" className="text-dark ms-2 fs-6">Instructor View</Badge>}</h3>
                    <p className="text-muted mb-0">Workspace Mode | Instructor: {course.instructor_username}</p>
                </div>
                <div className="d-flex gap-2">
                    {!isVIP && (
                        <Button variant="outline-warning" className="rounded-pill shadow-sm fw-bold px-4" onClick={() => setShowReviewModal(true)}>
                            ⭐ Leave a Review
                        </Button>
                    )}
                    {!isVIP && stats.percentage === 100 && (!course.quiz || quizResult?.passed) && (
                        <Button variant="success" className="rounded-pill shadow-sm fw-bold animate-pulse px-4" onClick={() => navigate(`/certificate/${courseId}`)}>
                            🏆 Claim Certificate
                        </Button>
                    )}
                </div>
            </div>

            <Row>
                <Col md={4} className="mb-3">
                    <Card className={`shadow-sm border rounded-4 overflow-hidden mb-3 ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white text-dark border-light'}`}>
                        <Card.Header className="bg-primary text-white font-weight-bold d-flex justify-content-between align-items-center py-3 border-0">
                            <span>Course Lessons</span>
                            {!isVIP && <span className="small text-white-50">{stats.percentage}% Done</span>}
                        </Card.Header>
                        
                        {!isVIP && (
                            <ProgressBar now={stats.percentage} variant={stats.percentage === 100 ? "success" : "info"} style={{ height: '6px', borderRadius: 0 }} />
                        )}

                        <ListGroup variant="flush">
                            {course.lessons.map((lesson, idx) => {
                                const isCompleted = !isVIP && stats.completed_lessons.includes(lesson.id);
                                
                                return (
                                    <ListGroup.Item 
                                        action 
                                        key={lesson.id}
                                        active={!activeQuizMode && activeLesson?.id === lesson.id}
                                        onClick={() => handleLessonClick(lesson)}
                                        className={`d-flex justify-content-between align-items-center py-3 border-bottom ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white text-dark border-light'}`}
                                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        <div className="d-flex align-items-center">
                                            <span className={`me-3 fw-bold ${(!activeQuizMode && activeLesson?.id === lesson.id) ? 'text-primary' : 'text-muted'}`}>
                                                {idx + 1}.
                                            </span>
                                            <span style={{ opacity: isCompleted && activeLesson?.id !== lesson.id ? 0.6 : 1 }}>
                                                {lesson.title}
                                            </span>
                                        </div>
                                        {isCompleted && (
                                            <span className="text-success ms-2 fs-5" title="Completed">✓</span>
                                        )}
                                    </ListGroup.Item>
                                );
                            })}

                            {course.quiz && (
                                <ListGroup.Item 
                                    action
                                    active={activeQuizMode}
                                    onClick={() => {
                                        if (videoRef.current) videoRef.current.pause();
                                        handlePause(); 
                                        setActiveLesson(null);
                                        setActiveQuizMode(true);
                                    }}
                                    className={`d-flex justify-content-between align-items-center py-3 font-weight-bold ${isDarkMode ? 'border-secondary' : 'border-light'}`}
                                    style={{ cursor: 'pointer', borderTop: '2px dashed #0d6efd' }}
                                >
                                    <span className={activeQuizMode ? 'text-white' : 'text-primary fw-bold'}>🎯 Final Exam Assessment</span>
                                    {quizResult?.passed ? (
                                        <Badge bg="success">Passed</Badge>
                                    ) : quizResult ? (
                                        <Badge bg="danger">Failed</Badge>
                                    ) : (
                                        <Badge bg="secondary">Pending</Badge>
                                    )}
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                    </Card>
                </Col>

                <Col md={8}>
                    {activeQuizMode ? (
                        <Card className={`shadow-sm border rounded-4 p-4 ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white text-dark border-light'}`}>
                            <div className="border-bottom border-secondary pb-3 mb-4 d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="fw-bold mb-1">{course.quiz.title}</h4>
                                    <p className="text-muted small mb-0">Requires minimum {course.quiz.passing_score}% accuracy parameters to clear.</p>
                                </div>
                                <Badge bg="primary" className="fs-6 px-3 py-2">Total Prompts: {course.quiz.questions?.length || 0}</Badge>
                            </div>

                            {error && <Alert variant="danger">{error}</Alert>}

                            {quizResult ? (
                                <div className="text-center py-4">
                                    <div className={`display-3 fw-bold mb-3 ${quizResult.passed ? 'text-success' : 'text-danger'}`}>
                                        {quizResult.score}%
                                    </div>
                                    <h5 className="fw-bold mb-2">{quizResult.passed ? '🎉 Congratulations!' : '❌ Evaluation Failed'}</h5>
                                    <p className="text-muted max-width-500 mx-auto mb-4">{quizResult.message}</p>
                                    {quizResult.passed ? (
                                        <Button variant="success" className="rounded-pill px-4 fw-bold shadow-sm" onClick={() => navigate(`/certificate/${courseId}`)}>
                                            Claim Earned Credentials
                                        </Button>
                                    ) : (
                                        <Button variant="outline-primary" className="rounded-pill px-4 fw-bold" onClick={() => setQuizResult(null)}>
                                            Re-attempt Examination
                                        </Button>
                                    )}
                                </div>
                            ) : (!course.quiz.questions || course.quiz.questions.length === 0) ? (
                                <div className="text-center p-5 text-muted">An instructor shell has initialized this exam container but has not added any questions yet.</div>
                            ) : (
                                <Form onSubmit={handleQuizSubmission}>
                                    {course.quiz.questions.map((q, idx) => (
                                        <div key={q.id} className={`mb-4 p-3 rounded-3 ${isDarkMode ? 'bg-secondary bg-opacity-10' : 'bg-light'}`}>
                                            <h6 className="fw-bold mb-3">{idx + 1}. {q.text}</h6>
                                            {q.choices?.map((choice) => (
                                                <Form.Check 
                                                    type="radio"
                                                    id={`q-${q.id}-c-${choice.id}`}
                                                    key={choice.id}
                                                    name={`question-${q.id}`}
                                                    label={choice.text}
                                                    className="mb-2 small"
                                                    checked={selectedAnswers[q.id] === choice.id}
                                                    onChange={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: choice.id })}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                    <Button type="submit" variant="primary" className="w-100 py-2 rounded-pill fw-bold text-uppercase mt-3" disabled={quizSubmitting}>
                                        {quizSubmitting ? 'Evaluating Responses...' : 'Submit Final Assessment Track'}
                                    </Button>
                                </Form>
                            )}
                        </Card>
                    ) : activeLesson ? (
                        <Card className={`shadow-sm border rounded-4 overflow-hidden ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white text-dark border-light'}`}>
                            <div className="ratio ratio-16x9 bg-black">
                                <video 
                                    key={activeLesson.id} 
                                    ref={videoRef}
                                    src={activeLesson.video_url} 
                                    controls
                                    onCanPlay={handleCanPlay} 
                                    onTimeUpdate={handleTimeUpdate} 
                                    onPause={handlePause} 
                                    onEnded={() => {
                                        if (activeLesson && !isVIP) {
                                            lastTrackedTimeRef.current = 0.0;
                                            saveProgress(activeLesson.id, 0.0, true);
                                        }
                                    }}
                                    className="w-100 h-100"
                                />
                            </div>
                            <Card.Body className="p-4">
                                <h4 className="fw-bold mb-2">{activeLesson.title}</h4>
                                <p className="text-muted mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                    {isVIP 
                                        ? "You are viewing this course as an Instructor. Progress tracking is disabled." 
                                        : "Your streaming playback is dynamically tracked and securely synchronized. Click pause at any point to save progress coordinates."
                                    }
                                </p>

                                {activeLesson.resources && activeLesson.resources.length > 0 && (
                                    <div className={`mt-4 pt-4 border-top ${isDarkMode ? 'border-secondary' : 'border-light'}`}>
                                        <h6 className="fw-bold mb-3 d-flex align-items-center">
                                            <span className="me-2">📁</span> Downloadable Resources
                                        </h6>
                                        <div className="d-flex flex-column gap-2">
                                            {activeLesson.resources.map(res => (
                                                <a 
                                                    key={res.id} 
                                                    href={res.file_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className={`btn btn-sm text-start d-flex align-items-center ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}
                                                >
                                                    <span className="me-2">📄</span> {res.title}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    ) : (
                        <div className="text-center p-5 bg-light rounded-4 text-muted border">
                            <div className="spinner-border text-primary mb-3" role="status"></div>
                            <div>Loading secure workspace pipelines...</div>
                        </div>
                    )}
                </Col>
            </Row>

            <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} contentClassName={isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white text-dark'}>
                <Modal.Header closeButton closeVariant={isDarkMode ? 'white' : undefined} className={isDarkMode ? 'border-secondary' : 'border-light'}>
                    <Modal.Title className="fw-bold">Rate this Course</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {reviewSuccess && <Alert variant="success">{reviewSuccess}</Alert>}
                    <Form.Group className="mb-3">
                        <Modal.Title className="fs-6 mb-2 fw-semibold">Overall Rating</Modal.Title>
                        <Form.Select 
                            value={reviewData.rating} 
                            onChange={e => setReviewData({...reviewData, rating: e.target.value})} 
                            className={isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-light text-dark'}
                        >
                            <option value="5">⭐⭐⭐⭐⭐ (5/5) Excellent</option>
                            <option value="4">⭐⭐⭐⭐ (4/5) Very Good</option>
                            <option value="3">⭐⭐⭐ (3/5) Average</option>
                            <option value="2">⭐⭐ (2/5) Poor</option>
                            <option value="1">⭐ (1/5) Terrible</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Modal.Title className="fs-6 mb-2 fw-semibold">Written Review (Optional)</Modal.Title>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            value={reviewData.comment} 
                            onChange={e => setReviewData({...reviewData, comment: e.target.value})} 
                            className={isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-light text-dark'} 
                            placeholder="What did you think of the course content?" 
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className={isDarkMode ? 'border-secondary' : 'border-light'}>
                    <Button variant="outline-secondary" onClick={() => setShowReviewModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmitReview} disabled={reviewSubmitting}>
                        {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default CourseWorkspace;