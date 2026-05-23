// frontend/src/pages/AnalyticsDashboard.jsx
import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ProgressBar, Alert, Spinner, Button, Accordion, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const AnalyticsDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const res = await axios.get('https://skillstream-backend-cxe5.onrender.com/api/courses/analytics/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAnalytics(res.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load telemetry data. Ensure you have instructor access.');
            }
        };
        fetchAnalytics();
    }, []);

    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    if (!analytics) return <Container className="mt-5 text-center"><Spinner animation="border" variant="primary" /></Container>;

    return (
        <Container className={`py-5 fade-in-up ${isDarkMode ? 'text-light' : 'text-dark'}`}>
            
            <div className="d-flex justify-content-between align-items-end mb-5">
                <div>
                    <h2 className={`fw-bold mb-1 ${isDarkMode ? 'text-light' : 'text-dark'}`}>Instructor Command Center</h2>
                    <p className="text-muted mb-0">Global Telemetry, Finance & Qualitative Feedback</p>
                </div>
                <Button variant={isDarkMode ? "outline-light" : "outline-dark"} className="rounded-pill" onClick={() => navigate('/dashboard')}>
                    &larr; Back to Dashboard
                </Button>
            </div>

            {/* SPRINT 3: Upgraded KPI Metric Cards (Now 4 Columns) */}
            <Row className="g-4 mb-5">
                <Col md={3}>
                    <Card className={`border shadow-sm h-100 rounded-4 ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white text-dark border-light'}`}>
                        <Card.Body className="p-4 text-center">
                            <h6 className="text-muted text-uppercase fw-bold letter-spacing-1 mb-3">Published Tracks</h6>
                            <h2 className="display-5 fw-bold text-primary mb-0">{analytics.total_courses}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className={`border shadow-sm h-100 rounded-4 ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white text-dark border-light'}`}>
                        <Card.Body className="p-4 text-center">
                            <h6 className="text-muted text-uppercase fw-bold letter-spacing-1 mb-3">Active Students</h6>
                            <h2 className="display-5 fw-bold text-info mb-0">{analytics.total_students}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className={`border shadow-sm h-100 rounded-4 ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white text-dark border-light'}`}>
                        <Card.Body className="p-4 text-center">
                            <h6 className="text-muted text-uppercase fw-bold letter-spacing-1 mb-3">Global Completion</h6>
                            <h2 className="display-5 fw-bold text-success mb-0">{analytics.overall_completion_rate}%</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className={`border shadow-sm h-100 rounded-4 ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white text-dark border-light'}`}>
                        <Card.Body className="p-4 text-center">
                            <h6 className="text-muted text-uppercase fw-bold letter-spacing-1 mb-3">Total Earnings</h6>
                            <h2 className="display-5 fw-bold text-warning mb-0">${analytics.total_revenue?.toFixed(2) || '0.00'}</h2>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <h4 className={`fw-bold mb-4 ${isDarkMode ? 'text-light' : 'text-dark'}`}>Course Performance Matrix</h4>
            
            {analytics.course_breakdown.length === 0 ? (
                <div className={`text-center p-5 rounded-4 border ${isDarkMode ? 'text-muted border-secondary bg-dark' : 'text-secondary border-light bg-light shadow-sm'}`}>
                    No analytics available. Publish your first course to start gathering data.
                </div>
            ) : (
                <Row className="g-4">
                    {analytics.course_breakdown.map((course) => (
                        <Col lg={6} key={course.id}>
                            <Card className={`border shadow-sm rounded-4 h-100 ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white text-dark border-light'}`}>
                                <Card.Body className="p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <span className="badge bg-primary mb-2 me-2">{course.category}</span>
                                            {/* SPRINT 3: Individual Course Revenue Badge */}
                                            <span className="badge bg-warning text-dark mb-2">💰 ${course.revenue?.toFixed(2)} Earned</span>
                                            <h5 className="fw-bold mb-0">{course.title}</h5>
                                        </div>
                                        <div className="text-end">
                                            <h3 className="fw-bold text-success mb-0">{course.completion_rate}%</h3>
                                            <small className="text-muted">Completed</small>
                                        </div>
                                    </div>
                                    
                                    <ProgressBar 
                                        now={course.completion_rate} 
                                        variant={course.completion_rate === 100 ? "success" : "info"}
                                        className="mb-3"
                                        style={{ height: '8px', backgroundColor: isDarkMode ? '#343a40' : '#e9ecef' }} 
                                    />
                                    
                                    <div className="d-flex justify-content-between text-muted small mb-3">
                                        <span>Total Enrollments: <strong className={isDarkMode ? 'text-light' : 'text-dark'}>{course.total_students}</strong></span>
                                        <Button 
                                            variant="link" 
                                            className="text-info p-0 text-decoration-none fw-bold"
                                            onClick={() => navigate(`/manage/course/${course.id}`)}
                                        >
                                            Manage Course &rarr;
                                        </Button>
                                    </div>

                                    {/* Instructor Feedback Section */}
                                    <Accordion>
                                        <Accordion.Item eventKey={course.id.toString()} className={isDarkMode ? 'bg-dark text-light border-secondary' : ''}>
                                            <Accordion.Header className={isDarkMode ? 'bg-dark text-light' : ''}>
                                                Student Feedback <Badge bg="secondary" className="ms-2">{course.reviews?.length || 0}</Badge>
                                            </Accordion.Header>
                                            <Accordion.Body className={isDarkMode ? 'bg-dark text-light' : ''}>
                                                {course.reviews && course.reviews.length > 0 ? (
                                                    course.reviews.map((rev, i) => (
                                                        <div key={i} className="mb-3 pb-2 border-bottom border-secondary">
                                                            <div className="d-flex justify-content-between mb-1">
                                                                <strong className="text-primary">{rev.username}</strong>
                                                                <small>{rev.rating} ⭐</small>
                                                            </div>
                                                            <p className="text-muted small mb-0">{rev.comment}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-muted small">No student reviews yet.</p>
                                                )}
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    </Accordion>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default AnalyticsDashboard;