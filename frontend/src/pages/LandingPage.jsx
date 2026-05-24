// frontend/src/pages/LandingPage.jsx
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Navbar, Card } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';
import AuthContext from '../context/AuthContext';

const LandingPage = () => {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();
    const { token, logoutUser } = useContext(AuthContext);
    const isAuthenticated = !!token;

    const handleLogout = () => {
        logoutUser();
    };

    return (
        <div 
            className="min-vh-100 d-flex flex-column fade-in-up"
            style={{ 
                backgroundColor: isDarkMode ? '#0f172a' : '#f0f4f8', 
                color: isDarkMode ? '#f8fafc' : '#0f172a' 
            }}
        >
            {/* --- INJECTED GLASSMORPHISM CSS --- */}
            <style>
                {`
                /* Unified Glass Effect for Navbar and Cards */
                .glass-navbar {
                    background: ${isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.4)'};
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border-bottom: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)'};
                    box-shadow: 0 4px 30px ${isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(31, 38, 135, 0.05)'};
                }

                .glass-card {
                    background: ${isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.4)'};
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)'};
                    box-shadow: 0 8px 32px 0 ${isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(31, 38, 135, 0.1)'};
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .glass-card:hover {
                    transform: translateY(-10px);
                    background: ${isDarkMode ? 'rgba(51, 65, 85, 0.7)' : 'rgba(255, 255, 255, 0.6)'};
                    box-shadow: 0 15px 45px 0 ${isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(31, 38, 135, 0.15)'};
                }
                `}
            </style>

            {/* FIXED GLASS NAVBAR */}
            <Navbar expand="lg" className="py-3 sticky-top glass-navbar" fixed="top">
                <Container>
                    <Navbar.Brand
                        className={`fw-bold d-flex align-items-center ${isDarkMode ? 'text-white' : 'text-dark'}`}
                        onClick={() => navigate('/')}
                        style={{ cursor: 'pointer' }}
                    >
                        {/* Compact Logo Icon */}
                        <img 
                            src="/skillstream-logo.png" 
                            alt="SkillStream Icon" 
                            height="28" 
                            className="me-2" 
                            style={{ objectFit: 'contain' }} 
                        />
                        SkillStream<span className="text-primary">.</span>
                    </Navbar.Brand>

                    <div className="d-flex align-items-center gap-2 ms-auto">
                        <Button
                            variant={isDarkMode ? 'outline-warning' : 'outline-dark'}
                            className="rounded-circle px-2 py-1"
                            onClick={toggleTheme}
                            title="Toggle Theme Mode"
                            style={{ width: '40px', height: '40px' }}
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </Button>

                        {isAuthenticated ? (
                            <>
                                <Button variant="primary" className="px-4 rounded-pill fw-medium ms-2 d-none d-sm-inline-block shadow-sm" onClick={() => navigate('/dashboard')}>
                                    Dashboard &rarr;
                                </Button>
                                <Button variant="outline-danger" className="px-4 rounded-pill fw-medium ms-2" onClick={handleLogout}>
                                    Sign Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant={isDarkMode ? 'outline-light' : 'outline-dark'} className="px-4 rounded-pill fw-medium ms-2 d-none d-sm-inline-block" onClick={() => navigate('/login')}>
                                    Log In
                                </Button>
                                <Button variant="primary" className="px-4 rounded-pill fw-medium ms-2 shadow-sm" onClick={() => navigate('/register')}>
                                    Sign Up
                                </Button>
                            </>
                        )}
                    </div>
                </Container>
            </Navbar>

            {/* HERO SECTION */}
            <Container className="my-auto pt-5 pb-5 flex-grow-1 d-flex flex-column justify-content-center" style={{ marginTop: '60px' }}>
                <Row className="align-items-center gy-5">
                    
                    {/* Left text panel & Full Logo */}
                    <Col xs={12} lg={6} className="text-center text-lg-start">
                        {/* Placed directly inside the column, above the text. 
                          This forces it to align perfectly with the left edge of the text.
                        */}
                        <img 
                            src="/skillstream-logo-full.png" 
                            alt="SkillStream Full Logo" 
                            className="img-fluid mb-3" 
                            style={{ maxHeight: '80px', objectFit: 'contain' }} 
                        />
                        <h1 className="display-4 mb-3" style={{ fontWeight: 400, letterSpacing: '-1.5px', lineHeight: '1.15' }}>
                            Upskill your team <br />
                            <span className="text-primary">seamlessly.</span>
                        </h1>
                        <p className="lead mb-4 pe-lg-5" style={{ fontSize: '1.15rem', opacity: 0.8 }}>
                            A high-fidelity corporate workspace built for rapid employee onboarding, modular training pipelines, and granular runtime progress synchronization tracking.
                        </p>
                        <div className="d-flex justify-content-center justify-content-lg-start gap-3">
                            {isAuthenticated ? (
                                <Button variant="primary" size="lg" className="px-5 py-3 rounded-pill fw-bold shadow-sm" onClick={() => navigate('/dashboard')}>
                                    Explore Courses 🚀
                                </Button>
                            ) : (
                                <>
                                    <Button variant="primary" size="lg" className="px-4 py-3 rounded-pill fw-bold shadow-sm" onClick={() => navigate('/register')}>
                                        Explore Our Courses  &rarr;
                                    </Button>
                                    <Button variant={isDarkMode ? 'outline-light' : 'outline-dark'} size="lg" className="px-4 py-3 rounded-pill fw-bold d-none d-sm-inline-block" onClick={() => navigate('/login')}>
                                        Log In
                                    </Button>
                                </>
                            )}
                        </div>
                    </Col>

                    {/* Right features - Glass Cards */}
                    <Col xs={12} lg={6}>
                        <Row className="g-4">
                            {[
                                { icon: '⚡', title: 'Smart Tracking', desc: 'Resumes individual video streams exactly where you left off down to the millisecond.' },
                                { icon: '🛡️', title: 'Role Hierarchy', desc: 'Granular instructor workflows separated completely from employee workspaces.' },
                                { icon: '📊', title: 'Analytics Metrics', desc: 'Watch progress distributions and performance percentages build out instantly.' },
                                { icon: '🏆', title: 'Gamified Badges', desc: 'Unlock unique achievement tracking badges as milestones are crushed.' },
                            ].map((feature, idx) => (
                                <Col xs={12} sm={6} key={idx}>
                                    <Card className="glass-card h-100 p-3 rounded-4">
                                        <Card.Body>
                                            <div className="fs-1 mb-3">{feature.icon}</div>
                                            <h5 className="fw-bold">{feature.title}</h5>
                                            <p className="small mb-0" style={{ opacity: 0.8 }}>{feature.desc}</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Col>
                </Row>
            </Container>

            {/* Footer */}
            <footer className={`border-top py-4 mt-auto ${isDarkMode ? 'border-secondary' : 'border-light'}`} style={{ backgroundColor: isDarkMode ? '#0b1120' : '#e2e8f0' }}>
                <Container className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <div className="small fw-medium" style={{ opacity: 0.7 }}>
                        &copy; {new Date().getFullYear()} SkillStream Inc. All corporate rights reserved.
                    </div>
                    <div className="d-flex gap-4 small fw-medium">
                        <a href="#" className={`text-decoration-none hover-dark ${isDarkMode ? 'text-light' : 'text-dark'}`} style={{ opacity: 0.7 }}>Terms</a>
                        <a href="#" className={`text-decoration-none hover-dark ${isDarkMode ? 'text-light' : 'text-dark'}`} style={{ opacity: 0.7 }}>Privacy Policy</a>
                        <a href="#" className={`text-decoration-none hover-dark ${isDarkMode ? 'text-light' : 'text-dark'}`} style={{ opacity: 0.7 }}>Security Matrix</a>
                    </div>
                </Container>
            </footer>
        </div>
    );
};

export default LandingPage;