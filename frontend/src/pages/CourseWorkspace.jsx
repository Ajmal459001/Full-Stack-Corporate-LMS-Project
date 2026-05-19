import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, ListGroup, Card, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const CourseWorkspace = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    
    const [course, setCourse] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null);
    const [initialTimeLoaded, setInitialTimeLoaded] = useState(false);
    const [error, setError] = useState('');

    const videoRef = useRef(null);
    
    // We use a mutable ref to hold the absolute latest timestamp without triggering component re-renders
    const lastTrackedTimeRef = useRef(0);

    // 1. Fetch initial course structural layout and saved checkpoints per lesson
    const fetchWorkspaceData = async (targetLessonId = null) => {
        try {
            const courseRes = await axios.get(`http://127.0.0.1:8000/api/courses/${courseId}/`);
            setCourse(courseRes.data);

            // Dynamically pass the lesson_id as a query parameter to our updated backend view setup
            const url = targetLessonId 
                ? `http://127.0.0.1:8000/api/courses/progress/${courseId}/?lesson_id=${targetLessonId}`
                : `http://127.0.0.1:8000/api/courses/progress/${courseId}/`;
                
            const progressRes = await axios.get(url);
            
            if (courseRes.data.lessons.length > 0) {
                // If we don't have an active lesson target configured yet, establish it
                if (!activeLesson) {
                    const lastSavedLessonId = progressRes.data.last_watched_lesson;
                    const savedLesson = courseRes.data.lessons.find(l => l.id === lastSavedLessonId);
                    setActiveLesson(savedLesson || courseRes.data.lessons[0]);
                }
                
                window.savedPlaybackTime = parseFloat(progressRes.data.last_timestamp) || 0.0;
                lastTrackedTimeRef.current = window.savedPlaybackTime;
            }
        } catch (err) {
            setError("Could not load course workspace data matrix.");
        }
    };

    useEffect(() => {
        fetchWorkspaceData();
    }, [courseId]);

    // 2. Seek to checkpoint position safely once player finishes buffering stream source
    const handleCanPlay = () => {
        if (videoRef.current && !initialTimeLoaded && window.savedPlaybackTime > 0) {
            console.log(`Seeking timeline to: ${window.savedPlaybackTime}s`);
            videoRef.current.currentTime = window.savedPlaybackTime;
            setInitialTimeLoaded(true);
        }
    };

    // 3. Centralized Save Progress Engine
    const saveProgress = async (lessonId, timestamp) => {
        if (!lessonId) return;
        
        // Guard clause: Completely block accidental 0s if we know the user has real progress saved
        if (timestamp === 0 && initialTimeLoaded && window.savedPlaybackTime > 0) {
            return;
        }

        try {
            await axios.post(`http://127.0.0.1:8000/api/courses/progress/${courseId}/`, {
                lesson_id: lessonId,
                timestamp: timestamp
            });
            console.log(`Saved: Lesson ${lessonId} at ${timestamp}s`);
            window.savedPlaybackTime = timestamp;
        } catch (err) {
            console.error("Failed to sync progress.", err);
        }
    };

    // 4. Continuously cache the current playback second in memory while the video plays
    const handleTimeUpdate = () => {
        if (videoRef.current && videoRef.current.currentTime > 0) {
            lastTrackedTimeRef.current = videoRef.current.currentTime;
        }
    };

    // 5. Explicitly save to database only when the user chooses to pause the player
    const handlePause = () => {
        if (activeLesson && lastTrackedTimeRef.current > 0) {
            saveProgress(activeLesson.id, lastTrackedTimeRef.current);
        }
    };

    // Handler when user triggers standard route departures
    const handleBackToDashboard = async () => {
        if (activeLesson && lastTrackedTimeRef.current > 0) {
            await saveProgress(activeLesson.id, lastTrackedTimeRef.current);
        }
        navigate('/');
    };

    if (error) return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
    if (!course) return <Container className="mt-4">Loading training workspace...</Container>;

    return (
        <Container fluid className="mt-4 px-4">
            <Button variant="outline-secondary" size="sm" className="mb-3" onClick={handleBackToDashboard}>
                &larr; Back to Dashboard
            </Button>
            
            <h3 className="mb-1">{course.title}</h3>
            <p className="text-muted mb-4">Workspace Mode | Instructor: {course.instructor_username}</p>

            <Row>
                {/* Left Sidebar */}
                <Col md={4} className="mb-3">
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-dark text-white font-weight-bold">Course Lessons</Card.Header>
                        <ListGroup variant="flush">
                            {course.lessons.map((lesson, idx) => (
                                <ListGroup.Item 
                                    action 
                                    key={lesson.id}
                                    active={activeLesson?.id === lesson.id}
                                    onClick={async () => {
                                        if (activeLesson?.id === lesson.id) return;
                                        
                                        // 1. Save the last valid tracked time in memory to DB BEFORE changing lessons
                                        if (lastTrackedTimeRef.current > 0) {
                                            await saveProgress(activeLesson.id, lastTrackedTimeRef.current);
                                        }
                                        
                                        // 2. Clear out parameters to make room for the new lesson video stream
                                        setInitialTimeLoaded(false);
                                        window.savedPlaybackTime = 0.0; 
                                        lastTrackedTimeRef.current = 0.0;
                                        
                                        // 3. Switch lesson state and immediately fetch its independent progress coordinates
                                        setActiveLesson(lesson);
                                        fetchWorkspaceData(lesson.id);
                                    }}
                                    className="d-flex justify-content-between align-items-center"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div>
                                        <span className="me-2 text-muted fw-bold">{idx + 1}.</span>
                                        {lesson.title}
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>
                </Col>

                {/* Right Panel */}
                <Col md={8}>
                    {activeLesson ? (
                        <Card className="shadow-sm border-0">
                            <div className="ratio ratio-16x9 bg-black rounded-top">
                                <video 
                                    key={activeLesson.id} 
                                    ref={videoRef}
                                    src={activeLesson.video_url} 
                                    controls
                                    onCanPlay={handleCanPlay} 
                                    onTimeUpdate={handleTimeUpdate} 
                                    onPause={handlePause} 
                                    className="w-100 h-100"
                                />
                            </div>
                            <Card.Body>
                                <h5>Active Lesson: {activeLesson.title}</h5>
                                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                                    Your streaming playback is dynamically tracked and securely synchronized. Click pause at any point to save progress coordinates.
                                </p>
                            </Card.Body>
                        </Card>
                    ) : (
                        <div className="text-center p-5 bg-light rounded text-muted">
                            No lessons published inside this track.
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default CourseWorkspace;