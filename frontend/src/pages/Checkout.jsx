// frontend/src/pages/Checkout.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Spinner, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const Checkout = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    
    const [course, setCourse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const res = await axios.get(`http://127.0.0.1:8000/api/courses/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCourse(res.data);
            } catch (err) {
                console.error("Failed to fetch course details", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourse();
    }, [id]);

    const handleStripeCheckout = async () => {
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.post(`http://127.0.0.1:8000/api/courses/checkout/create-session/${id}/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // This is the magic! We teleport the user to Stripe's secure servers.
            window.location.href = res.data.checkout_url;
        } catch (err) {
            console.error("Failed to initiate Stripe session", err);
            setIsProcessing(false);
            alert("Payment gateway error. Please try again.");
        }
    };

    if (isLoading) return <div className="text-center py-5 mt-5"><Spinner animation="border" variant="primary" /></div>;
    if (!course) return <div className="text-center py-5 mt-5 text-danger">Course not found.</div>;

    return (
        <Container className="py-5 fade-in-up d-flex justify-content-center align-items-center min-vh-100">
            <Card className={`border-0 shadow-lg p-4 rounded-4 ${isDarkMode ? 'bg-secondary bg-opacity-25 text-white' : 'bg-white text-dark'}`} style={{ maxWidth: '600px', width: '100%' }}>
                <Card.Body>
                    <div className="text-center mb-4">
                        <Badge bg="primary" className="rounded-pill px-3 py-2 mb-3">Secure Checkout</Badge>
                        <h2 className="fw-bold">Complete Your Enrollment</h2>
                        <p className="text-muted">You are one step away from unlocking this workspace.</p>
                    </div>

                    <div className={`p-4 rounded-4 mb-4 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
                        <h5 className="fw-bold text-primary mb-1">{course.title}</h5>
                        <p className="small text-muted mb-3">By {course.instructor_username}</p>
                        
                        <div className="d-flex justify-content-between align-items-center border-top border-secondary pt-3 mt-3">
                            <span className="fw-medium">Total Cost:</span>
                            {/* NEW: Dynamic Price Display */}
                            <span className="fs-4 fw-bold text-success">${course.price}</span>
                        </div>
                        <div className="text-end text-muted small mt-1">
                            Includes {course.validity_days} days of full workspace access.
                        </div>
                    </div>

                    <div className="d-grid gap-3">
                        <Button 
                            variant="success" 
                            size="lg" 
                            className="rounded-pill fw-bold shadow"
                            onClick={handleStripeCheckout}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Spinner size="sm" /> : '💳 Proceed to Payment'}
                        </Button>
                        <Button 
                            variant="outline-secondary" 
                            className="rounded-pill"
                            onClick={() => navigate('/catalog')}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Checkout;