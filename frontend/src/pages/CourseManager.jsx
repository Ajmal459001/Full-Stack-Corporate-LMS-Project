// frontend/src/pages/CourseManager.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, ListGroup, Badge, ButtonGroup, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const CourseManager = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    
    // Core States
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('curriculum'); // Tab toggle state
    
    // Curriculum States
    const [newLesson, setNewLesson] = useState({ title: '', video_url: '', order: 1 });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState(null);
    const [newResource, setNewResource] = useState({ title: '', file_url: '' });

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

    const getAuthHeaders = () => {
        const token = localStorage.getItem('access_token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchCourseData = async () => {
        try {
            const config = getAuthHeaders();
            const courseRes = await axios.get(`http://127.0.0.1:8000/api/courses/${courseId}/`, config);
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

    // --- SPRINT 1: Curriculum & Resources Logic ---
    const handleAddOrUpdateLesson = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            const config = getAuthHeaders();
            if (editingLessonId) {
                await axios.patch(`http://127.0.0.1:8000/api/courses/lessons/${editingLessonId}/`, newLesson, config);
                await fetchCourseData();
            } else {
                await axios.post(`http://127.0.0.1:8000/api/courses/lessons/`, { course: courseId, ...newLesson }, config);
                setNewLesson({ title: '', video_url: '', order: lessons.length + 2 });
                await fetchCourseData(); 
            }
        } catch (err) { setError("Failed to save lesson."); } finally { setIsSubmitting(false); }
    };

    const handleEditClick = (lesson) => {
        setEditingLessonId(lesson.id);
        setNewLesson({ title: lesson.title, video_url: lesson.video_url, order: lesson.order });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingLessonId(null);
        setNewLesson({ title: '', video_url: '', order: lessons.length + 1 });
        setNewResource({ title: '', file_url: '' });
    };

    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm("Delete this video module?")) return;
        try {
            await axios.delete(`http://127.0.0.1:8000/api/courses/lessons/${lessonId}/`, getAuthHeaders());
            if (editingLessonId === lessonId) handleCancelEdit();
            fetchCourseData(); 
        } catch (err) { setError("Failed to delete lesson."); }
    };

    const handleAddResource = async () => {
        if (!newResource.title || !newResource.file_url) return setError("Resource title and URL required.");
        try {
            await axios.post(`http://127.0.0.1:8000/api/courses/resources/`, { lesson: editingLessonId, ...newResource }, getAuthHeaders());
            setNewResource({ title: '', file_url: '' });
            fetchCourseData(); 
        } catch (err) { setError("Failed to attach resource."); }
    };

    const handleDeleteResource = async (resourceId) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/courses/resources/${resourceId}/`, getAuthHeaders());
            fetchCourseData(); 
        } catch (err) { setError("Failed to delete resource."); }
    };

    // --- SPRINT 2: Assessment Builder Logic ---
    const handleCreateQuiz = async () => {
        try {
            await axios.post('http://127.0.0.1:8000/api/courses/quizzes/', {
                course: courseId, title: 'Final Course Assessment', passing_score: 80
            }, getAuthHeaders());
            fetchCourseData();
        } catch(err) { setError("Failed to initialize assessment."); }
    };

    const handleSaveQuestion = async (e) => {
        e.preventDefault();
        if(!questionText || choices.some(c => !c.text)) return setError("Please fill out the question and all 4 choices.");
        
        setIsSubmitting(true);
        try {
            const qRes = await axios.post('http://127.0.0.1:8000/api/courses/questions/', {
                quiz: course.quiz.id, text: questionText, order: course.quiz.questions ? course.quiz.questions.length + 1 : 1
            }, getAuthHeaders());

            await Promise.all(choices.map(c => 
                axios.post('http://127.0.0.1:8000/api/courses/choices/', { question: qRes.data.id, ...c }, getAuthHeaders())
            ));

            setQuestionText('');
            setChoices([{ text: '', is_correct: true }, { text: '', is_correct: false }, { text: '', is_correct: false }, { text: '', is_correct: false }]);
            fetchCourseData();
        } catch(err) { setError("Failed to save question."); } finally { setIsSubmitting(false); }
    };

    const handleDeleteQuestion = async (qId) => {
        if(!window.confirm("Delete this question?")) return;
        try {
            await axios.delete(`http://127.0.0.1:8000/api/courses/questions/${qId}/`, getAuthHeaders());
            fetchCourseData();
        } catch(err) { setError("Failed to delete question."); }
    };

    if (!course) return <Container className={`mt-5 text-center ${isDarkMode ? 'text-light' : 'text-dark'}`}>Loading Course Matrix...</Container>;

    return (
        <Container className={`py-5 fade-in-up ${isDarkMode ? 'text-light' : 'text-dark'}`}>
            <Button variant="outline-secondary" className="mb-4 rounded-pill" onClick={() => navigate('/dashboard')}>
                &larr; Back to Dashboard
            </Button>
            
            <Row className="g-4">
                <Col md={4}>
                    <Card className={`border-0 shadow-sm rounded-4 overflow-hidden mb-3 ${isDarkMode ? 'bg-secondary bg-opacity-25 text-white' : 'bg-white text-dark'}`}>
                        {course.thumbnail ? (
                            <Card.Img variant="top" src={course.thumbnail} style={{ height: '200px', objectFit: 'cover' }} />
                        ) : (
                            <div className="bg-primary bg-opacity-10 w-100 d-flex align-items-center justify-content-center" style={{ height: '200px' }}><span className="text-primary fw-bold">No Cover</span></div>
                        )}
                        <Card.Body className="p-4">
                            <Badge bg="primary" className="mb-2 rounded-pill">{course.category}</Badge>
                            <h4 className="fw-bold">{course.title}</h4>
                            <p className="text-muted small mb-0">{course.description}</p>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={8}>
                    {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
                    
                    {/* Tab Navigation System */}
                    <ButtonGroup className="w-100 mb-4 shadow-sm rounded-pill overflow-hidden">
                        <Button 
                            variant={activeTab === 'curriculum' ? 'primary' : (isDarkMode ? 'dark' : 'light')} 
                            onClick={() => setActiveTab('curriculum')}
                            className={`fw-bold py-2 ${activeTab !== 'curriculum' && (isDarkMode ? 'border-secondary text-light' : 'border-light text-dark')}`}
                        >
                            📚 Curriculum Builder
                        </Button>
                        <Button 
                            variant={activeTab === 'assessment' ? 'primary' : (isDarkMode ? 'dark' : 'light')} 
                            onClick={() => setActiveTab('assessment')}
                            className={`fw-bold py-2 ${activeTab !== 'assessment' && (isDarkMode ? 'border-secondary text-light' : 'border-light text-dark')}`}
                        >
                            🎯 Final Assessment
                        </Button>
                    </ButtonGroup>

                    {activeTab === 'curriculum' ? (
                        <>
                            <Card className={`border-0 shadow-sm rounded-4 mb-4 ${isDarkMode ? 'bg-secondary bg-opacity-25 text-white border-secondary' : 'bg-white text-dark border-light'}`}>
                                <Card.Header className="bg-transparent border-bottom-0 pt-4 px-4 pb-0">
                                    <h5 className="fw-bold">{editingLessonId ? '✏️ Update Video Module' : '➕ Attach Video Module'}</h5>
                                </Card.Header>
                                <Card.Body className="p-4">
                                    <Form onSubmit={handleAddOrUpdateLesson}>
                                        <Row className="g-3">
                                            <Col md={8}>
                                                <Form.Label className="small fw-semibold">Lesson Title</Form.Label>
                                                <Form.Control type="text" required className={isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-light text-dark'} value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})} />
                                            </Col>
                                            <Col md={4}>
                                                <Form.Label className="small fw-semibold">Playback Order</Form.Label>
                                                <Form.Control type="number" required min="1" className={isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-light text-dark'} value={newLesson.order} onChange={e => setNewLesson({...newLesson, order: parseInt(e.target.value)})} />
                                            </Col>
                                            <Col md={12}>
                                                <Form.Label className="small fw-semibold">Stream URL (MP4 / WebM)</Form.Label>
                                                <Form.Control type="url" required className={isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-light text-dark'} value={newLesson.video_url} onChange={e => setNewLesson({...newLesson, video_url: e.target.value})} />
                                            </Col>
                                        </Row>
                                        <div className="d-flex gap-2 mt-4">
                                            <Button variant={editingLessonId ? "warning" : "success"} type="submit" className="rounded-pill px-4 fw-bold shadow-sm" disabled={isSubmitting}>
                                                {isSubmitting ? 'Saving...' : (editingLessonId ? 'Update Lesson Basics' : 'Save Lesson Pipeline')}
                                            </Button>
                                            {editingLessonId && <Button variant="outline-secondary" className="rounded-pill px-4 fw-bold" onClick={handleCancelEdit}>Close Editor</Button>}
                                        </div>
                                    </Form>

                                    {/* Downloadable Resources Form */}
                                    {editingLessonId && (
                                        <div className={`mt-4 pt-4 border-top ${isDarkMode ? 'border-secondary' : 'border-light'}`}>
                                            <h6 className="fw-bold mb-3">📁 Attach Resources</h6>
                                            {lessons.find(l => l.id === editingLessonId)?.resources?.map(r => (
                                                <div key={r.id} className={`d-flex justify-content-between align-items-center mb-2 p-2 rounded ${isDarkMode ? 'bg-dark border border-secondary' : 'bg-light border border-light'}`}>
                                                    <span className="small fw-semibold">📄 {r.title}</span>
                                                    <Button variant="outline-danger" size="sm" className="rounded-circle px-2" onClick={() => handleDeleteResource(r.id)}>🗑️</Button>
                                                </div>
                                            ))}
                                            <Row className="g-2 mt-3 align-items-end">
                                                <Col md={5}><Form.Control type="text" size="sm" className={isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white'} value={newResource.title} onChange={e => setNewResource({...newResource, title: e.target.value})} placeholder="Title (e.g. Starter.zip)"/></Col>
                                                <Col md={5}><Form.Control type="url" size="sm" className={isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white'} value={newResource.file_url} onChange={e => setNewResource({...newResource, file_url: e.target.value})} placeholder="URL (https://...)"/></Col>
                                                <Col md={2}><Button variant="primary" size="sm" className="w-100 fw-bold" onClick={handleAddResource}>Attach</Button></Col>
                                            </Row>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>

                            <h5 className="fw-bold mb-3 mt-5">Current Curriculum Track</h5>
                            {lessons.length === 0 ? (
                                <div className={`text-center p-5 rounded-4 border ${isDarkMode ? 'text-muted border-secondary bg-dark' : 'text-secondary border-light bg-white shadow-sm'}`}>This course shell is empty. Add your first video above.</div>
                            ) : (
                                <ListGroup className="shadow-sm rounded-4">
                                    {lessons.map((lesson) => (
                                        <ListGroup.Item key={lesson.id} className={`d-flex justify-content-between align-items-center p-3 border ${editingLessonId === lesson.id ? 'border-warning' : (isDarkMode ? 'border-secondary' : 'border-light')} ${isDarkMode ? 'bg-dark text-light' : 'bg-white text-dark'}`}>
                                            <div className="d-flex align-items-center flex-grow-1" style={{ cursor: 'pointer' }} onClick={() => handleEditClick(lesson)}>
                                                <div className="bg-primary text-white border-0 rounded text-center me-3 shadow-sm" style={{ width: '40px', height: '40px', lineHeight: '40px', fontWeight: 'bold' }}>{lesson.order}</div>
                                                <div>
                                                    <h6 className="mb-0 fw-bold">{lesson.title} {lesson.resources?.length > 0 && <Badge bg="info" className="ms-2 text-dark">📁 {lesson.resources.length}</Badge>}</h6>
                                                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>{lesson.video_url.substring(0, 50)}...</small>
                                                </div>
                                            </div>
                                            <Button variant="outline-danger" size="sm" className="rounded-circle px-2 ms-3" onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson.id); }}>🗑️</Button>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </>
                    ) : (
                        // SPRINT 2: THE ASSESSMENT BUILDER UI
                        <>
                            {!course.quiz ? (
                                <Card className={`border-0 shadow-sm rounded-4 text-center p-5 ${isDarkMode ? 'bg-secondary bg-opacity-25 text-white' : 'bg-white text-dark'}`}>
                                    <h4 className="fw-bold mb-3">No Final Assessment Active</h4>
                                    <p className="text-muted">Test your students' knowledge before allowing them to claim a certificate.</p>
                                    <Button variant="primary" className="rounded-pill fw-bold px-4 mx-auto mt-2" style={{maxWidth: '250px'}} onClick={handleCreateQuiz}>
                                        Enable Assessment
                                    </Button>
                                </Card>
                            ) : (
                                <>
                                    <Card className={`border-0 shadow-sm rounded-4 mb-4 ${isDarkMode ? 'bg-secondary bg-opacity-25 text-white border-secondary' : 'bg-white text-dark border-light'}`}>
                                        <Card.Header className="bg-transparent border-bottom-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                                            <h5 className="fw-bold mb-0">➕ Add a Question</h5>
                                            <Badge bg="info" className="text-dark">Passing Score: {course.quiz.passing_score}%</Badge>
                                        </Card.Header>
                                        <Card.Body className="p-4">
                                            <Form onSubmit={handleSaveQuestion}>
                                                <Form.Group className="mb-4">
                                                    <Form.Label className="small fw-semibold">Question Prompt</Form.Label>
                                                    <Form.Control type="text" required className={isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-light text-dark border-light'} value={questionText} onChange={e => setQuestionText(e.target.value)} placeholder="e.g., What is the primary purpose of the React Virtual DOM?" />
                                                </Form.Group>
                                                
                                                <Form.Label className="small fw-semibold mb-2">Multiple Choice Options (Select the correct answer via the radio button)</Form.Label>
                                                {choices.map((choice, index) => (
                                                    <InputGroup className="mb-2 shadow-sm" key={index}>
                                                        <InputGroup.Radio 
                                                            name="correctChoice" 
                                                            checked={choice.is_correct}
                                                            onChange={() => {
                                                                const newChoices = choices.map((c, i) => ({ ...c, is_correct: i === index }));
                                                                setChoices(newChoices);
                                                            }}
                                                        />
                                                        <Form.Control 
                                                            type="text" 
                                                            required
                                                            placeholder={`Option ${index + 1}`}
                                                            className={isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-light text-dark border-light'}
                                                            value={choice.text}
                                                            onChange={e => {
                                                                const newChoices = [...choices];
                                                                newChoices[index].text = e.target.value;
                                                                setChoices(newChoices);
                                                            }}
                                                        />
                                                    </InputGroup>
                                                ))}
                                                <Button type="submit" variant="success" className="rounded-pill px-4 mt-3 fw-bold shadow-sm" disabled={isSubmitting}>
                                                    {isSubmitting ? 'Saving to Database...' : 'Save Question to Bank'}
                                                </Button>
                                            </Form>
                                        </Card.Body>
                                    </Card>

                                    <h5 className="fw-bold mb-3 mt-5">Question Bank ({course.quiz.questions?.length || 0})</h5>
                                    {(!course.quiz.questions || course.quiz.questions.length === 0) ? (
                                        <div className={`text-center p-4 rounded-4 border ${isDarkMode ? 'text-muted border-secondary bg-dark' : 'text-secondary border-light bg-white shadow-sm'}`}>
                                            No questions have been added to the test bank yet.
                                        </div>
                                    ) : (
                                        <ListGroup className="shadow-sm rounded-4">
                                            {course.quiz.questions.map((q, idx) => (
                                                <ListGroup.Item key={q.id} className={`p-4 border ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white text-dark border-light'}`}>
                                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                                        <h6 className="fw-bold mb-0 text-primary">{idx + 1}. {q.text}</h6>
                                                        <Button variant="outline-danger" size="sm" className="rounded-circle px-2" onClick={() => handleDeleteQuestion(q.id)}>🗑️</Button>
                                                    </div>
                                                    <ul className="mb-0 small" style={{ listStyleType: 'none', paddingLeft: 0 }}>
                                                        {q.choices.map((c) => (
                                                            <li key={c.id} className={`mb-1 p-2 rounded ${c.is_correct ? (isDarkMode ? 'bg-success bg-opacity-25 text-success fw-bold' : 'bg-success bg-opacity-10 text-success fw-bold') : 'text-muted'}`}>
                                                                {c.is_correct ? '✅ ' : '❌ '} {c.text}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default CourseManager;