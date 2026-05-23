// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ButtonGroup } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext'; // NEW: Import Theme Context

const Register = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme(); // NEW: Grab Theme State
    
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
            await axios.post('http://127.0.0.1:8000/api/courses/register/', formData);
            // On success, teleport them to the login page
            navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`min-vh-100 d-flex align-items-center justify-content-center fade-in-up py-5 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
            <Container>
                <Row className="justify-content-center">
                    <Col md={6} lg={5}>
                        <div className="text-center mb-4">
                            <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded p-2 mb-3 shadow-sm" style={{ width: '50px', height: '50px', fontSize: '24px', fontWeight: 'bold' }}>
                                S
                            </div>
                            <h2 className={`fw-bold letter-spacing-1 text-uppercase ${isDarkMode ? 'text-light' : 'text-dark'}`}>SkillStream</h2>
                            <p className="text-muted">Create your account to get started.</p>
                        </div>

                        <Card className={`border shadow-lg rounded-4 overflow-hidden ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white text-dark border-light'}`}>
                            <Card.Body className="p-5">
                                {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}
                                
                                <Form onSubmit={handleSubmit}>
                                    
                                    {/* Role Selector Toggle */}
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