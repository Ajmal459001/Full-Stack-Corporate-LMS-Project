// frontend/src/pages/Login.jsx
import { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Form, Button, Container, Card, Alert, Row, Col } from 'react-bootstrap';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; 

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { loginUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { isDarkMode } = useTheme(); 
    
    const successMessage = location.state?.message;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await loginUser(username, password);
            if (result.success) {
                navigate('/dashboard'); 
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="min-vh-100 d-flex align-items-center justify-content-center fade-in-up py-5"
            style={{ 
                backgroundColor: isDarkMode ? '#0f172a' : '#f0f4f8', 
                color: isDarkMode ? '#f8fafc' : '#0f172a' 
            }}
        >
            <style>
                {`
                .glass-card {
                    background: ${isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.4)'};
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.8)'};
                    box-shadow: 0 8px 32px 0 ${isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(31, 38, 135, 0.08)'};
                }
                `}
            </style>

            <Container>
                <Row className="justify-content-center">
                    <Col md={6} lg={5}>
                        <div className="text-center mb-4">
                            {/* NEW: Wrapped logo in a Link to redirect to Landing Page */}
                            <Link to="/">
                                <img 
                                    src="/skillstream-logo-full.png" 
                                    alt="SkillStream Logo" 
                                    className="img-fluid mb-3" 
                                    style={{ maxHeight: '70px', objectFit: 'contain', cursor: 'pointer' }} 
                                />
                            </Link>
                            <p className="text-muted fw-medium">Welcome back. Please sign in to continue.</p>
                        </div>

                        <Card className="glass-card border-0 rounded-4 overflow-hidden">
                            <Card.Body className="p-5">
                                {successMessage && <Alert variant="success" className="rounded-3">{successMessage}</Alert>}
                                {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}
                                
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3" controlId="formBasicUsername">
                                        <Form.Label className={`small fw-semibold ${isDarkMode ? 'text-light' : 'text-dark'}`}>Username</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter your username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                            className={`py-2 ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-light text-dark border-light'}`}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4" controlId="formBasicPassword">
                                        <Form.Label className={`small fw-semibold ${isDarkMode ? 'text-light' : 'text-dark'}`}>Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className={`py-2 ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-light text-dark border-light'}`}
                                        />
                                    </Form.Group>

                                    <Button 
                                        variant="primary" 
                                        type="submit" 
                                        className="w-100 rounded-pill py-2 fw-bold text-uppercase letter-spacing-1 shadow"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Authenticating...' : 'Sign In'}
                                    </Button>
                                    
                                    <div className={`text-center mt-4 pt-3 border-top ${isDarkMode ? 'border-secondary' : 'border-light'}`}>
                                        <span className="text-muted small">Don't have an account yet? </span>
                                        <Link to="/register" className="text-info text-decoration-none small fw-bold">
                                            Create Account &rarr;
                                        </Link>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Login;