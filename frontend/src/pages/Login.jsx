// frontend/src/pages/Login.jsx
import { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Form, Button, Container, Card, Alert, Row, Col } from 'react-bootstrap';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // NEW: Import Theme Context

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { loginUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { isDarkMode } = useTheme(); // NEW: Grab Theme State
    
    // Catch the success message if they just registered!
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
        <div className={`min-vh-100 d-flex align-items-center justify-content-center fade-in-up py-5 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
            <Container>
                <Row className="justify-content-center">
                    <Col md={6} lg={5}>
                        {/* Logo and Header Block */}
                        <div className="text-center mb-4">
                            <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded p-2 mb-3 shadow-sm" style={{ width: '50px', height: '50px', fontSize: '24px', fontWeight: 'bold' }}>
                                S
                            </div>
                            <h2 className={`fw-bold letter-spacing-1 text-uppercase ${isDarkMode ? 'text-light' : 'text-dark'}`}>SkillStream</h2>
                            <p className="text-muted">Welcome back. Please sign in to continue.</p>
                        </div>

                        <Card className={`border shadow-lg rounded-4 overflow-hidden ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white text-dark border-light'}`}>
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