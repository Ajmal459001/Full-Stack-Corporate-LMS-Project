// frontend/src/pages/LandingPage.jsx
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Navbar, Card } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';
import AuthContext from '../context/AuthContext';

const LandingPage = () => {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();

    // Pull the token and logout function directly from Context
    const { token, logoutUser } = useContext(AuthContext);

    // If token exists, they are authenticated
    const isAuthenticated = !!token;

    // Trigger the context wipe
    const handleLogout = () => {
        logoutUser();
    };

    return (
        <div className={`min-vh-100 d-flex flex-column fade-in-up ${isDarkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>

            {/* Responsive Navbar */}
            <Navbar expand="lg" className="py-3 border-bottom sticky-top shadow-sm" bg={isDarkMode ? 'dark' : 'white'}>
                <Container>
                    <Navbar.Brand
                        className={`fw-bold ${isDarkMode ? 'text-white' : 'text-dark'}`}
                        onClick={() => navigate('/')}
                        style={{ cursor: 'pointer' }}
                    >
                        SkillStream<span className="text-primary">.</span>
                    </Navbar.Brand>

                    <div className="d-flex align-items-center gap-2 ms-auto">
                        {/* Theme Switcher Button */}
                        <Button
                            variant={isDarkMode ? 'outline-warning' : 'outline-dark'}
                            className="rounded-circle px-2 py-1"
                            onClick={toggleTheme}
                            title="Toggle Theme Mode"
                            style={{ width: '40px', height: '40px' }}
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </Button>

                        {/* Smart Navbar Buttons */}
                        {isAuthenticated ? (
                            <>
                                <Button
                                    variant="primary"
                                    className="px-4 rounded-pill fw-medium ms-2 d-none d-sm-inline-block"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    Dashboard &rarr;
                                </Button>
                                <Button
                                    variant="outline-danger"
                                    className="px-4 rounded-pill fw-medium ms-2"
                                    onClick={handleLogout}
                                >
                                    Sign Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant={isDarkMode ? 'outline-light' : 'outline-dark'}
                                    className="px-4 rounded-pill fw-medium ms-2 d-none d-sm-inline-block"
                                    onClick={() => navigate('/login')}
                                >
                                    Log In
                                </Button>
                                <Button
                                    variant="primary"
                                    className="px-4 rounded-pill fw-medium ms-2 shadow-sm"
                                    onClick={() => navigate('/register')}
                                >
                                    Sign Up
                                </Button>
                            </>
                        )}
                    </div>
                </Container>
            </Navbar>

            {/* Hero Section - Fully Responsive Container */}
            <Container className="my-auto py-5 flex-grow-1 d-flex align-items-center">
                <Row className="align-items-center gy-5">

                    {/* Left text */}
                    <Col xs={12} lg={6} className="text-center text-lg-start">
                        <h1 className="display-4 mb-3" style={{ fontWeight: 400, letterSpacing: '-1.5px', lineHeight: '1.15' }}>
                            Upskill your team <br />
                            <span className="text-primary">seamlessly.</span>
                        </h1>
                        <p className="lead text-muted mb-4 pe-lg-5" style={{ fontSize: '1.1rem' }}>
                            A high-fidelity corporate workspace built for rapid employee onboarding, modular training pipelines, and granular runtime progress synchronization tracking.
                        </p>
                        <div className="d-flex justify-content-center justify-content-lg-start gap-3">
                            {isAuthenticated ? (
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="px-5 py-3 rounded-pill fw-bold shadow-sm"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    Explore Courses 🚀
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="px-4 py-3 rounded-pill fw-bold shadow-sm"
                                        onClick={() => navigate('/register')}
                                    >
                                        Explore Our Courses  &rarr;
                                    </Button>
                                    <Button
                                        variant={isDarkMode ? 'outline-light' : 'outline-dark'}
                                        size="lg"
                                        className="px-4 py-3 rounded-pill fw-bold d-none d-sm-inline-block"
                                        onClick={() => navigate('/login')}
                                    >
                                        Log In
                                    </Button>
                                </>
                            )}
                        </div>
                    </Col>

                    {/* Right features */}
                    <Col xs={12} lg={6}>
                        <Row className="g-4">
                            <Col xs={12} sm={6}>
                                <Card className={`border-0 shadow-sm h-100 p-2 rounded-4 hover-animate ${isDarkMode ? 'bg-secondary bg-opacity-25 text-white' : 'bg-white text-dark'}`}>
                                    <Card.Body>
                                        <div className="fs-2 mb-2">⚡</div>
                                        <h5 className="fw-bold">Smart Tracking</h5>
                                        <p className="text-muted small mb-0">Resumes individual video streams exactly where you left off down to the millisecond.</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card className={`border-0 shadow-sm h-100 p-2 rounded-4 hover-animate ${isDarkMode ? 'bg-secondary bg-opacity-25 text-white' : 'bg-white text-dark'}`}>
                                    <Card.Body>
                                        <div className="fs-2 mb-2">🛡️</div>
                                        <h5 className="fw-bold">Role Hierarchy</h5>
                                        <p className="text-muted small mb-0">Granular instructor workflows separated completely from employee workspaces.</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card className={`border-0 shadow-sm h-100 p-2 rounded-4 hover-animate ${isDarkMode ? 'bg-secondary bg-opacity-25 text-white' : 'bg-white text-dark'}`}>
                                    <Card.Body>
                                        <div className="fs-2 mb-2">📊</div>
                                        <h5 className="fw-bold">Analytics Metrics</h5>
                                        <p className="text-muted small mb-0">Watch progress distributions and performance percentages build out instantly.</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card className={`border-0 shadow-sm h-100 p-2 rounded-4 hover-animate ${isDarkMode ? 'bg-secondary bg-opacity-25 text-white' : 'bg-white text-dark'}`}>
                                    <Card.Body>
                                        <div className="fs-2 mb-2">🏆</div>
                                        <h5 className="fw-bold">Gamified Badges</h5>
                                        <p className="text-muted small mb-0">Unlock unique achievement tracking badges as milestones are crushed.</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>

            {/* Footer */}
            <footer className={`border-top py-4 mt-auto ${isDarkMode ? 'bg-dark border-secondary' : 'bg-white'}`}>
                <Container className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <div className="small text-muted">
                        &copy; {new Date().getFullYear()} SkillStream Inc. All corporate rights reserved.
                    </div>
                    <div className="d-flex gap-4 small text-muted">
                        <a href="#" className="text-decoration-none text-reset hover-dark">Terms</a>
                        <a href="#" className="text-decoration-none text-reset hover-dark">Privacy Policy</a>
                        <a href="#" className="text-decoration-none text-reset hover-dark">Security Matrix</a>
                    </div>
                </Container>
            </footer>
        </div>
    );
};

export default LandingPage;