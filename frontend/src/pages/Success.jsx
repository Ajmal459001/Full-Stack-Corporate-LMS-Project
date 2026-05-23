// frontend/src/pages/Success.jsx
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Card, Spinner, Button } from 'react-bootstrap';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const Success = () => {
    const [searchParams] = useSearchParams();
    const courseId = searchParams.get('course_id');
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    
    const [status, setStatus] = useState('processing'); 
    const hasFetched = useRef(false); // Prevents React StrictMode double-firing

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const enrollUser = async () => {
            try {
                const token = localStorage.getItem('access_token');
                await axios.post('http://127.0.0.1:8000/api/courses/checkout/success/', 
                    { course_id: courseId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setStatus('success');
            } catch (error) {
                console.error(error);
                setStatus('error');
            }
        };

        if (courseId) {
            enrollUser();
        } else {
            setStatus('error');
        }
    }, [courseId]);

    return (
        <Container className="py-5 d-flex justify-content-center align-items-center min-vh-100 fade-in-up">
            <Card className={`border-0 shadow-lg p-5 rounded-4 text-center ${isDarkMode ? 'bg-secondary bg-opacity-25 text-white' : 'bg-white text-dark'}`} style={{ maxWidth: '500px', width: '100%' }}>
                <Card.Body>
                    {status === 'processing' && (
                        <>
                            <Spinner animation="grow" variant="primary" className="mb-4" style={{ width: '3rem', height: '3rem' }} />
                            <h3 className="fw-bold">Securing Workspace...</h3>
                            <p className="text-muted">Please wait while we finalize your enrollment.</p>
                        </>
                    )}
                    
                    {status === 'success' && (
                        <>
                            <div className="display-1 text-success mb-3">🎉</div>
                            <h3 className="fw-bold">Payment Successful!</h3>
                            <p className="text-muted mb-4">Your enrollment is officially confirmed. The training module has been securely added to your workspace.</p>
                            <Button variant="primary" size="lg" className="rounded-pill px-5 fw-bold shadow" onClick={() => navigate('/dashboard')}>
                                Go to Workspace &rarr;
                            </Button>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="display-1 text-danger mb-3">⚠️</div>
                            <h3 className="fw-bold">Something went wrong.</h3>
                            <p className="text-muted mb-4">We could not verify your enrollment. If you were charged, please contact support.</p>
                            <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => navigate('/catalog')}>
                                Return to Catalog
                            </Button>
                        </>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Success;