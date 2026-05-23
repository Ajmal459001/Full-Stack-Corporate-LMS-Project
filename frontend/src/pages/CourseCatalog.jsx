// frontend/src/pages/CourseCatalog.jsx
import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Spinner, Pagination, Modal, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const CourseCatalog = () => {
    const [courses, setCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Modal state for viewing reviews
    const [selectedCourse, setSelectedCourse] = useState(null);
    
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses(searchQuery, currentPage);
    }, [currentPage]); 

    const fetchCourses = async (search = '', page = 1) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const url = `http://127.0.0.1:8000/api/courses/?search=${search}&page=${page}`;

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && res.data.results) {
                setCourses(res.data.results);
                const itemsPerPage = res.data.results.length || 2;
                setTotalPages(Math.ceil(res.data.count / itemsPerPage));
            } else {
                setCourses(Array.isArray(res.data) ? res.data : []);
                setTotalPages(1);
            }
        } catch (error) {
            console.error("Failed to load catalog:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1); 
        fetchCourses(searchQuery, 1);
    };

    return (
        <Container className={`py-5 fade-in-up ${isDarkMode ? 'text-light' : 'text-dark'}`}>
            <Button variant={isDarkMode ? "outline-light" : "outline-dark"} className="mb-4 rounded-pill" onClick={() => navigate('/dashboard')}>
                &larr; Back to Workspace
            </Button>
            
            <div className="text-center mb-5">
                <h2 className="fw-bold mb-2">Corporate Learning Catalog</h2>
                <p className="text-muted">Browse and enroll in high-fidelity training modules.</p>

                <Row className="justify-content-center mt-4">
                    <Col md={6}>
                        <Form onSubmit={handleSearch}>
                            <InputGroup className={`shadow-sm rounded-pill overflow-hidden border ${isDarkMode ? 'border-secondary' : 'border-light'}`}>
                                <Form.Control
                                    type="text"
                                    placeholder="Search courses..."
                                    className={`${isDarkMode ? 'bg-dark text-light border-0' : 'bg-white text-dark border-0'} px-4 py-2`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Button variant="primary" type="submit" className="px-4 fw-bold">Search</Button>
                            </InputGroup>
                        </Form>
                    </Col>
                </Row>
            </div>

            {isLoading ? (
                <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
            ) : courses.length === 0 ? (
                <div className={`text-center p-5 rounded-4 border ${isDarkMode ? 'text-muted border-secondary bg-dark' : 'text-secondary border-light bg-white'}`}>
                    No training modules found matching your criteria.
                </div>
            ) : (
                <Row className="g-4">
                    {courses.map((course) => (
                        <Col md={6} lg={4} key={course.id}>
                            <Card className={`shadow-sm h-100 rounded-4 overflow-hidden border ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white text-dark border-light'}`}>
                                {course.thumbnail ? (
                                    <Card.Img variant="top" src={course.thumbnail} style={{ height: '180px', objectFit: 'cover' }} />
                                ) : (
                                    <div className="bg-secondary bg-opacity-25 w-100 d-flex align-items-center justify-content-center" style={{ height: '180px' }}>
                                        <span className="text-muted fw-bold">SkillStream Module</span>
                                    </div>
                                )}
                                <Card.Body className="p-4 d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <Badge bg="primary" className="rounded-pill px-3 py-2">{course.category}</Badge>
                                        <Button variant="link" size="sm" className="p-0 text-info text-decoration-none fw-bold" onClick={() => setSelectedCourse(course)}>
                                            ⭐ {course.average_rating > 0 ? course.average_rating : 'New'} ({course.reviews?.length || 0})
                                        </Button>
                                    </div>
                                    <h5 className="fw-bold mt-2">{course.title}</h5>
                                    <p className="text-muted small flex-grow-1">{course.description.substring(0, 100)}...</p>
                                    <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top border-secondary">
                                        <small className="text-muted">By {course.instructor_username}</small>
                                        <Button variant="primary" size="sm" className="rounded-pill px-4 fw-bold" onClick={() => navigate(`/checkout/${course.id}`)}>
                                            Enroll Now &rarr;
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Review Modal */}
            <Modal show={!!selectedCourse} onHide={() => setSelectedCourse(null)} contentClassName={isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white text-dark'}>
                <Modal.Header closeButton closeVariant={isDarkMode ? 'white' : undefined} className={isDarkMode ? 'border-secondary' : 'border-light'}>
                    <Modal.Title className="fw-bold">Reviews for {selectedCourse?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedCourse?.reviews?.length > 0 ? (
                        <ListGroup variant="flush">
                            {selectedCourse.reviews.map(r => (
                                <ListGroup.Item key={r.id} className={isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white'}>
                                    <div className="d-flex justify-content-between mb-1">
                                        <strong className="text-primary">{r.username}</strong>
                                        <small>{r.rating} ⭐</small>
                                    </div>
                                    <p className="text-muted small mb-0">{r.comment}</p>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    ) : <p className="text-muted">No community feedback yet for this course.</p>}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default CourseCatalog;