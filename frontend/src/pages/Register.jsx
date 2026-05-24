// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ButtonGroup } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext'; 

const Register = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme(); 
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'EMPLOYEE' // Default to employee
    });
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await axios.post('https://skillstream-backend-cxe5.onrender.com/api/courses/register/', formData);
            navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed. Please try again.");
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
                            <p className="text-muted fw-medium">Create your account to get started.</p>
                        </div>

                        <Card className="glass-card border-0 rounded-4 overflow-hidden">
                            <Card.Body className="p-5">
                                {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}
                                
                                <Form onSubmit={handleSubmit}>
                                    
                                    <Form.Group className="mb-4 text-center">
                                        <Form.Label className="small fw-semibold text-muted text-uppercase letter-spacing-1 d-block mb-2">I am registering as an:</Form.Label>
                                        <ButtonGroup className="w-100 shadow-sm">
                                            <Button 
                                                variant={formData.role === 'EMPLOYEE' ? 'primary' : (isDarkMode ? 'outline-secondary' : 'outline-dark')}
                                                onClick={() => setFormData({...formData, role: 'EMPLOYEE'})}
                                                className="fw-bold py-2"
                                            >
                                                🎓 Employee
                                            </Button>
                                            <Button 
                                                variant={formData.role === 'INSTRUCTOR' ? 'primary' : (isDarkMode ? 'outline-secondary' : 'outline-dark')}
                                                onClick={() => setFormData({...formData, role: 'INSTRUCTOR'})}
                                                className="fw-bold py-2"
                                            >
                                                👨‍🏫 Instructor
                                            </Button>
                                        </ButtonGroup>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className={`small fw-semibold ${isDarkMode ? 'text-light' : 'text-dark'}`}>Username</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            required 
                                            className={`py-2 ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-light text-dark border-light'}`}
                                            placeholder="Choose a username"
                                            value={formData.username}
                                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className={`small fw-semibold ${isDarkMode ? 'text-light' : 'text-dark'}`}>Email Address</Form.Label>
                                        <Form.Control 
                                            type="email" 
                                            required 
                                            className={`py-2 ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-light text-dark border-light'}`}
                                            placeholder="name@company.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className={`small fw-semibold ${isDarkMode ? 'text-light' : 'text-dark'}`}>Password</Form.Label>
                                        <Form.Control 
                                            type="password" 
                                            required 
                                            className={`py-2 ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-light text-dark border-light'}`}
                                            placeholder="Create a secure password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        />
                                    </Form.Group>

                                    <Button 
                                        variant="primary" 
                                        type="submit" 
                                        className="w-100 rounded-pill py-2 fw-bold text-uppercase letter-spacing-1 shadow"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Creating Account...' : 'Register Now'}
                                    </Button>
                                </Form>
                                
                                <div className={`text-center mt-4 pt-3 border-top ${isDarkMode ? 'border-secondary' : 'border-light'}`}>
                                    <span className="text-muted small">Already have an account? </span>
                                    <Link to="/login" className="text-info text-decoration-none small fw-bold">
                                        Sign In Here &rarr;
                                    </Link>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Register;