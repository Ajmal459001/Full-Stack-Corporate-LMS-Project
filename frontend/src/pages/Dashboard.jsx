// frontend/src/pages/Dashboard.jsx
import { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Form, Navbar, Pagination, Alert, ProgressBar } from 'react-bootstrap';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import AuthContext from '../context/AuthContext'; 

const Dashboard = () => {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();
    const { logoutUser } = useContext(AuthContext); 

    const [courses, setCourses] = useState([]);
    const [statsMap, setStatsMap] = useState({}); // NEW: Holds both progress AND days remaining
    const [userProfile, setUserProfile] = useState(null);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [newCourse, setNewCourse] = useState({
        title: '',
        description: '',
        category: 'Frontend Web Development',
        difficulty: 'BEGINNER',
        price: 49.99,         // NEW
        validity_days: 30,    // NEW
        thumbnail: null
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) throw new Error("No token found");

                const res = await axios.get('https://skillstream-backend-cxe5.onrender.com/api/auth/user/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserProfile(res.data);
            } catch (err) {
                console.error("Failed to load user profile");
            }
        };
        fetchUserProfile();
    }, []);

    const fetchCourses = useCallback(async () => {
        try {
            let url = `https://skillstream-backend-cxe5.onrender.com/api/courses/my_workspace/?search=${search}&page=${currentPage}`;
            if (category) url += `&category=${category}`;
            if (difficulty) url += `&difficulty=${difficulty}`;

            const token = localStorage.getItem('access_token');
            const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` }});

            let loadedCourses = [];
            if (res.data && res.data.results) {
                loadedCourses = res.data.results;
                const assumedPageSize = res.data.results.length || 2;
                setTotalPages(Math.ceil(res.data.count / assumedPageSize));
            } else if (Array.isArray(res.data)) {
                loadedCourses = res.data;
                setTotalPages(1);
            }

            setCourses(loadedCourses);

            // NEW: Fetch both progress percentage AND days remaining
            const newStatsMap = {};
            await Promise.all(loadedCourses.map(async (c) => {
                try {
                    const statRes = await axios.get(`https://skillstream-backend-cxe5.onrender.com/api/courses/stats/${c.id}/`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    newStatsMap[c.id] = {
                        progress: statRes.data.percentage,
                        days_remaining: statRes.data.days_remaining
                    };
                } catch (e) {
                    newStatsMap[c.id] = { progress: 0, days_remaining: 0 };
                }
            }));
            setStatsMap(newStatsMap); 

        } catch (err) {
            console.error("Failed to load courses.", err);
        }
    }, [search, category, difficulty, currentPage]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleSubmitCourse = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access_token');
            const formData = new FormData();
            formData.append('title', newCourse.title);
            formData.append('description', newCourse.description);
            formData.append('category', newCourse.category);
            formData.append('difficulty', newCourse.difficulty);
            formData.append('price', newCourse.price); // NEW
            formData.append('validity_days', newCourse.validity_days); // NEW

            if (newCourse.thumbnail) {
                formData.append('thumbnail', newCourse.thumbnail);
            }

            const headers = { Authorization: `Bearer ${token}` };

            if (editingCourseId) {
                await axios.patch(`https://skillstream-backend-cxe5.onrender.com/api/courses/${editingCourseId}/`, formData, { headers });
                setNewCourse({ title: '', description: '', category: 'Frontend Web Development', difficulty: 'BEGINNER', price: 49.99, validity_days: 30, thumbnail: null });
                setEditingCourseId(null);
                setShowAddForm(false);
                fetchCourses();
            } else {
                const res = await axios.post('https://skillstream-backend-cxe5.onrender.com/api/courses/', formData, { headers });
                navigate(`/manage/course/${res.data.id}`);
            }
        } catch (err) {
            setError(editingCourseId ? "Failed to update course." : "Failed to create the course track module.");
        }
    };

    const handleEditClick = (course) => {
        setNewCourse({
            title: course.title,
            description: course.description,
            category: course.category,
            difficulty: course.difficulty,
            price: course.price || 49.99,
            validity_days: course.validity_days || 30,
            thumbnail: null
        });
        setEditingCourseId(course.id);
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm("Are you absolutely sure you want to delete this course? This cannot be undone.")) return;
        try {
            const token = localStorage.getItem('access_token');
            await axios.delete(`https://skillstream-backend-cxe5.onrender.com/api/courses/${courseId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(courses.filter(c => c.id !== courseId));
            fetchCourses();
        } catch (err) {
            setError("Failed to delete the course. Check your permissions.");
        }
    };

    return (
        <div className={`min-vh-100 fade-in-up ${isDarkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
            <Navbar bg={isDarkMode ? 'dark' : 'white'} className="border-bottom py-3 mb-4 shadow-sm">
                <Container>
                    <Navbar.Brand className={`fw-bold ${isDarkMode ? 'text-white' : 'text-dark'}`}>
                        SkillStream<span className="text-primary">.</span> Workspace
                    </Navbar.Brand>
                    <div className="d-flex align-items-center gap-3">
                        {userProfile && (
                            <div className="d-flex align-items-center gap-2 me-2">
                                <span className="small text-muted fw-medium">{userProfile.username}</span>
                                <Badge bg={userProfile.role?.toUpperCase() === 'ADMIN' ? 'danger' : 'success'} className="rounded-pill px-2 py-1 uppercase small">
                                    {userProfile.role || 'Instructor'}
                                </Badge>
                            </div>
                        )}
                        <Button variant={isDarkMode ? 'outline-warning' : 'outline-dark'} onClick={toggleTheme} style={{ width: '40px', height: '40px' }} className="rounded-circle px-2 py-1">
                            {isDarkMode ? '☀️' : '🌙'}
                        </Button>
                        <Button variant="outline-danger" size="sm" className="rounded-pill px-3" onClick={() => { logoutUser(); navigate('/'); }}>Logout</Button>
                    </div>
                </Container>
            </Navbar>

            <Container className="pb-5">
                {error && <Alert variant="warning" onClose={() => setError('')} dismissible>{error}</Alert>}

                {userProfile && (userProfile.role?.toUpperCase() === 'ADMIN' || userProfile.role?.toUpperCase() === 'INSTRUCTOR') && (
                    <div className="mb-4 text-end">
                        <Button
                            variant={showAddForm ? "outline-secondary" : "primary"}
                            className="rounded-pill px-4 fw-medium shadow-sm"
                            onClick={() => {
                                setShowAddForm(!showAddForm);
                                setEditingCourseId(null);
                                setNewCourse({ title: '', description: '', category: 'Frontend Web Development', difficulty: 'BEGINNER', price: 49.99, validity_days: 30, thumbnail: null });
                            }}
                        >
                            {showAddForm ? "Cancel Form" : "➕ Create New Course Track"}
                        </Button>
                        <Button variant="outline-info" className="rounded-pill px-4 fw-medium shadow-sm ms-2" onClick={() => navigate('/analytics')}>
                            📊 View Analytics
                        </Button>
                    </div>
                )}

                {userProfile && userProfile.role?.toUpperCase() === 'EMPLOYEE' && (
                    <div className="mb-4 text-center text-md-start">
                        <Button variant="primary" size="lg" className="rounded-pill px-5 py-3 fw-bold shadow-sm w-100 w-md-auto" onClick={() => navigate('/catalog')}>
                            Browse Course Catalog 📚
                        </Button>
                    </div>
                )}

                {showAddForm && (
                    <Card className={`border-0 shadow-sm p-4 mb-4 rounded-4 fade-in-up ${isDarkMode ? 'bg-secondary bg-opacity-25 text-white' : 'bg-white'}`}>
                        <Card.Body>
                            <h5 className="fw-bold mb-3">{editingCourseId ? "✏️ Update Training Module" : "Publish New Training Module"}</h5>
                            <Form onSubmit={handleSubmitCourse}>
                                <Row className="g-3">
                                    <Col xs={12} md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold">Course Title</Form.Label>
                                            <Form.Control type="text" required value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} className={isDarkMode ? 'bg-dark text-white border-secondary' : ''} />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={6} md={3}>
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold">Category</Form.Label>
                                            <Form.Select value={newCourse.category} onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })} className={isDarkMode ? 'bg-dark text-white border-secondary' : ''}>
                                                <option value="Frontend Web Development">Frontend Web Development</option>
                                                <option value="Backend Development">Backend Development</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={6} md={3}>
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold">Difficulty Level</Form.Label>
                                            <Form.Select value={newCourse.difficulty} onChange={(e) => setNewCourse({ ...newCourse, difficulty: e.target.value })} className={isDarkMode ? 'bg-dark text-white border-secondary' : ''}>
                                                <option value="BEGINNER">Beginner</option>
                                                <option value="INTERMEDIATE">Intermediate</option>
                                                <option value="ADVANCED">Advanced</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>

                                    {/* NEW: Price and Validity Inputs */}
                                    <Col xs={6} md={3}>
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold">Price ($)</Form.Label>
                                            <Form.Control type="number" step="0.01" min="0" required value={newCourse.price} onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })} className={isDarkMode ? 'bg-dark text-white border-secondary' : ''} />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={6} md={3}>
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold">Access Duration (Days)</Form.Label>
                                            <Form.Control type="number" min="1" required value={newCourse.validity_days} onChange={(e) => setNewCourse({ ...newCourse, validity_days: e.target.value })} className={isDarkMode ? 'bg-dark text-white border-secondary' : ''} />
                                        </Form.Group>
                                    </Col>

                                    <Col xs={12} md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold">
                                                {editingCourseId ? "Update Thumbnail Image (Leave blank to keep current)" : "Course Thumbnail Image"}
                                            </Form.Label>
                                            <Form.Control type="file" accept="image/*" onChange={(e) => setNewCourse({ ...newCourse, thumbnail: e.target.files[0] })} className={isDarkMode ? 'bg-dark text-white border-secondary' : ''} />
                                        </Form.Group>
                                    </Col>
                                    
                                    <Col xs={12}>
                                        <Form.Group className="mt-2">
                                            <Form.Label className="small fw-semibold">Description Summary</Form.Label>
                                            <Form.Control as="textarea" rows={3} required value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} className={isDarkMode ? 'bg-dark text-white border-secondary' : ''} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Button variant={editingCourseId ? "warning" : "success"} type="submit" className="rounded-pill px-4 mt-3 float-end">
                                    {editingCourseId ? "Save Changes" : "Commit & Publish Module"}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                )}

                <Card className={`border-0 shadow-sm p-3 mb-4 rounded-4 ${isDarkMode ? 'bg-secondary bg-opacity-25' : 'bg-white'}`}>
                    <Card.Body>
                        <Row className="g-3">
                            <Col xs={12} md={6} lg={4}>
                                <Form.Control type="text" placeholder="Search matching course tracks..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className={isDarkMode ? 'bg-dark text-white border-secondary' : ''} />
                            </Col>
                            <Col xs={6} md={3} lg={4}>
                                <Form.Select value={category} onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }} className={isDarkMode ? 'bg-dark text-white border-secondary' : ''}>
                                    <option value="">All Categories</option>
                                    <option value="Frontend Web Development">Frontend</option>
                                    <option value="Backend Development">Backend</option>
                                </Form.Select>
                            </Col>
                            <Col xs={6} md={3} lg={4}>
                                <Form.Select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setCurrentPage(1); }} className={isDarkMode ? 'bg-dark text-white border-secondary' : ''}>
                                    <option value="">All Levels</option>
                                    <option value="BEGINNER">Beginner</option>
                                    <option value="INTERMEDIATE">Intermediate</option>
                                    <option value="ADVANCED">Advanced</option>
                                </Form.Select>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <h4 className="mb-4 fw-bold">Your Workspace</h4>

                <Row xs={1} md={2} lg={3} className="g-4 mb-4">
                    {courses.map((course) => (
                        <Col key={course.id}>
                            <Card className={`h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative hover-animate ${isDarkMode ? 'bg-secondary bg-opacity-25 text-white' : 'bg-white text-dark'}`}>
                                {userProfile && (userProfile.role?.toUpperCase() === 'ADMIN' || userProfile.username === course.instructor_username) && (
                                    <div className="position-absolute top-0 end-0 p-2 d-flex gap-2 z-index-1" style={{ zIndex: 10 }}>
                                        <Button variant="warning" size="sm" className="rounded-circle shadow" style={{ width: '32px', height: '32px', padding: 0 }} onClick={() => handleEditClick(course)}>✏️</Button>
                                        <Button variant="danger" size="sm" className="rounded-circle shadow" style={{ width: '32px', height: '32px', padding: 0 }} onClick={() => handleDeleteCourse(course.id)}>🗑️</Button>
                                    </div>
                                )}

                                {course.thumbnail ? (
                                    <Card.Img variant="top" src={course.thumbnail} style={{ height: '180px', objectFit: 'cover' }} />
                                ) : (
                                    <div className="bg-primary bg-opacity-10 w-100 d-flex align-items-center justify-content-center" style={{ height: '180px' }}>
                                        <span className="text-primary fw-bold opacity-50">No Cover Available</span>
                                    </div>
                                )}

                                <Card.Body className="d-flex flex-column p-4">
                                    <Badge bg="primary" className="mb-3 align-self-start rounded-pill px-3 py-2" style={{ fontSize: '0.75rem' }}>{course.category}</Badge>
                                    <h5 className="fw-bold mb-2">{course.title}</h5>

                                    <div className="d-flex gap-2 mt-2 mb-3">
                                        <Badge bg="success" className="px-2 py-1 fs-6">${course.price || "49.99"}</Badge>
                                        <Badge bg="secondary" className="px-2 py-1 fs-6">📅 {course.validity_days || "30"} Days Access</Badge>
                                    </div>
                                    
                                    <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top border-light border-opacity-10">
                                        <small className="text-muted">By {course.instructor_username || 'Instructor'}</small>
                                        <Badge bg={course.difficulty === 'ADVANCED' ? 'danger' : 'secondary'} className="rounded-pill">{course.difficulty}</Badge>
                                    </div>

                                    {/* NEW: Employee Progress AND Countdown Tracker! */}
                                    {statsMap[course.id] !== undefined && userProfile?.role?.toUpperCase() === 'EMPLOYEE' && (
                                        <div className="mt-3 bg-dark p-3 rounded-3 border border-secondary">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <Badge bg="warning" text="dark" className="rounded-pill">
                                                    ⏳ {statsMap[course.id].days_remaining} Days Left
                                                </Badge>
                                                <small className="fw-bold text-success">{statsMap[course.id].progress}% Done</small>
                                            </div>
                                            <ProgressBar now={statsMap[course.id].progress} variant={statsMap[course.id].progress === 100 ? "success" : "primary"} style={{ height: '6px' }} className="rounded-pill" />
                                        </div>
                                    )}

                                    <Button variant={isDarkMode ? 'light' : 'dark'} size="sm" className="mt-3 w-100 rounded-pill py-2 fw-medium shadow-sm" onClick={() => navigate(`/course/${course.id}`)}>
                                        Enter Workspace &rarr;
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {courses.length === 0 && <div className="text-center py-5 text-muted">No modules found. Head to the catalog to enroll!</div>}

                <div className="d-flex justify-content-center mt-5">
                    <Pagination>
                        <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} />
                        {[...Array(totalPages).keys()].map((pageIdx) => (
                            <Pagination.Item key={pageIdx + 1} active={currentPage === pageIdx + 1} onClick={() => setCurrentPage(pageIdx + 1)}>
                                {pageIdx + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages <= 1} />
                    </Pagination>
                </div>
            </Container>
        </div>
    );
};

export default Dashboard;