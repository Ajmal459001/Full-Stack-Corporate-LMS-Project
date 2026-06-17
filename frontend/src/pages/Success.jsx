// frontend/src/pages/Success.jsx
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Card, Spinner, Button } from 'react-bootstrap';
import api from '../api'; // FIXED: Imported central API instance
import { useTheme } from '../context/ThemeContext';

const Success = () => {
    const [searchParams] = useSearchParams();
    const courseId = searchParams.get('course_id');
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    
    const [status, setStatus] = useState('processing'); 
    const hasFetched = useRef(false); 

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const enrollUser = async () => {
            try {
                // FIXED: Removed manual token retrieval and headers; the api interceptor handles this automatically
                await api.post('/api/courses/checkout/success/', { course_id: courseId });
                
                setStatus('success');
                
                // Auto-redirect to workspace for a smoother UX presentation
                setTimeout(() => {
                    navigate('/dashboard');
                }, 3500);

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
    }, [courseId, navigate]);

    return (
        <div 
            className="min-vh-100 d-flex align-items-center justify-content-center fade-in-up py-5"
            style={{ 
                backgroundColor: isDarkMode ? '#0f172a' : '#f0f4f8', 
                color: isDarkMode ? '#f8fafc' : '#0f172a' 
            }}
        >
            {/* --- INJECTED GLASSMORPHISM CSS --- */}
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

            <Container className="text-center">
                <Card className="glass-card border-0 shadow-lg p-5 rounded-4 mx-auto" style={{ maxWidth: '500px', width: '100%' }}>
                    <Card.Body>
                        {status === 'processing' && (
                            <>
                                <Spinner animation="grow" variant="primary" className="mb-4" style={{ width: '3rem', height: '3rem' }} />
                                <h3 className="fw-bold">Securing Workspace...</h3>
                                <p className="text-muted">Please wait while we finalize your enterprise enrollment.</p>
                            </>
                        )}
                        
                        {status === 'success' && (
                            <div className="fade-in-up">
                                <div className="display-1 text-success mb-3">🎉</div>
                                <h3 className="fw-bold">Payment Successful!</h3>
                                <p className="text-muted mb-4">Your enrollment is officially confirmed. You are being securely redirected to your workspace.</p>
                                <Button variant="primary" size="lg" className="rounded-pill px-5 fw-bold shadow" onClick={() => navigate('/dashboard')}>
                                    Enter Workspace Now
                                </Button>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="fade-in-up">
                                <div className="display-1 text-danger mb-3">⚠️</div>
                                <h3 className="fw-bold">Verification Failed</h3>
                                <p className="text-muted mb-4">We could not verify your enrollment. If your card was charged, please contact IT support.</p>
                                <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => navigate('/catalog')}>
                                    Return to Catalog
                                </Button>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default Success;