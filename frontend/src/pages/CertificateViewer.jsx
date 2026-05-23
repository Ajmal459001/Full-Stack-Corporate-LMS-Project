// frontend/src/pages/CertificateViewer.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CertificateViewer = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    
    const [certData, setCertData] = useState(null);
    const [error, setError] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    
    const certificateRef = useRef(null);

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                const res = await axios.get(`https://skillstream-backend-cxe5.onrender.com/api/courses/certificate/${courseId}/`);
                setCertData(res.data);
            } catch (err) {
                if (err.response?.status === 403) {
                    // FIX: Dynamically read the exact error message sent by Django!
                    setError(err.response.data?.error || "You have not reached 100% completion for this course yet.");
                } else {
                    setError("Failed to locate certificate record. Please try again.");
                }
            }
        };
        fetchCertificate();
    }, [courseId]);

    const handleDownloadPDF = async () => {
        if (!certificateRef.current) return;
        setIsDownloading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 500)); 

            const canvas = await html2canvas(certificateRef.current, {
                scale: 3, 
                useCORS: true,
                backgroundColor: '#F9F8F6',
                logging: false
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF('landscape', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${certData.student_name.replace(' ', '_')}_Certificate.pdf`);
            
        } catch (err) {
            console.error("Failed to generate PDF", err);
            setError("Failed to generate the PDF file.");
        } finally {
            setIsDownloading(false);
        }
    };

    // Helper function to force proper Title Case (admin -> Admin, JOHN -> John)
    const formatName = (name) => {
        if (!name) return "";
        return name.toLowerCase().split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    if (error) return (
        <Container className="mt-5 text-center fade-in-up">
            <Alert variant="danger" className="d-inline-block px-5">{error}</Alert>
            <br />
            <Button variant="outline-dark" className="mt-3 rounded-pill" onClick={() => navigate(-1)}>
                &larr; Go Back
            </Button>
        </Container>
    );
    
    if (!certData) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;

    return (
        <div className="min-vh-100 bg-dark py-5 fade-in-up">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Montserrat:ital,wght@0,300;0,400;0,600;1,300&display=swap');
                `}
            </style>

            <Container className="d-flex flex-column align-items-center">
                
                <div className="w-100 d-flex justify-content-between align-items-center mb-4" style={{ maxWidth: '1056px' }}>
                    <Button variant="outline-light" className="rounded-pill px-4" onClick={() => navigate(`/course/${courseId}`)}>
                        &larr; Back to Workspace
                    </Button>
                    <Button 
                        variant="primary" 
                        className="rounded-pill px-4 fw-bold shadow-sm" 
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                    >
                        {isDownloading ? 'Generating PDF...' : '⬇ Download Official PDF'}
                    </Button>
                </div>

                <div className="w-100" style={{ overflowX: 'auto', display: 'flex', justifyContent: 'center', paddingBottom: '20px' }}>
                    
                    <div 
                        ref={certificateRef}
                        className="shadow-lg flex-shrink-0 position-relative" 
                        style={{ 
                            width: '1056px', 
                            height: '816px', 
                            backgroundColor: '#F9F8F6', 
                            color: '#2C2C2C', 
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '60px'
                        }}
                    >
                        {/* Background subtle elements */}
                        <div style={{
                            position: 'absolute',
                            top: '-20%', left: '-10%',
                            width: '140%', height: '140%',
                            background: 'radial-gradient(circle at 20% 80%, rgba(0,0,0,0.02) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(0,0,0,0.02) 0%, transparent 40%)',
                            zIndex: 0,
                            pointerEvents: 'none'
                        }}></div>

                        <div className="position-relative w-100 h-100 d-flex flex-column align-items-center text-center" style={{ zIndex: 1 }}>
                            
                            {/* CORPORATE LOGO INJECTION */}
                            <div className="mb-2" style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {/* IMPORTANT: Place your logo file (e.g., logo.png or logo.svg) in the frontend/public/ folder! 
                                  Then update the src below to "/logo.png". 
                                  For now, this is a beautifully styled colored CSS placeholder so you can see the layout.
                                  <img src="/logo.png" alt="SkillStream" style={{ height: '50px' }} />
                                */}
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '10px' 
                                }}>
                                    <div style={{
                                        width: '40px', height: '40px', 
                                        background: 'linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%)', // Vibrant corporate blue
                                        borderRadius: '8px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontWeight: 'bold', fontSize: '24px', fontFamily: 'sans-serif'
                                    }}>S</div>
                                    <span style={{ 
                                        fontFamily: "'Montserrat', sans-serif", 
                                        fontWeight: 700, 
                                        fontSize: '22px', 
                                        color: '#0d6efd',
                                        letterSpacing: '2px',
                                        textTransform: 'uppercase'
                                    }}>
                                        SkillStream
                                    </span>
                                </div>
                            </div>

                            <div className="mt-1 mb-2">
                                <h1 style={{ 
                                    fontFamily: "'Alex Brush', cursive", 
                                    fontSize: '130px', 
                                    lineHeight: '1',
                                    marginBottom: '-10px',
                                    fontWeight: 'normal',
                                    color: '#2b2b2b'
                                }}>
                                    Certificate
                                </h1>
                                <p style={{ 
                                    fontFamily: "'Montserrat', sans-serif", 
                                    fontSize: '16px',
                                    letterSpacing: '10px',
                                    fontWeight: 400,
                                    textTransform: 'uppercase',
                                    color: '#4a4a4a',
                                    marginLeft: '10px' 
                                }}>
                                    Of Completion
                                </p>
                            </div>

                            <div className="mt-4 mb-4">
                                <p style={{ 
                                    fontFamily: "'Montserrat', sans-serif", 
                                    fontStyle: 'italic',
                                    fontSize: '18px',
                                    fontWeight: 300,
                                    color: '#666'
                                }}>
                                    proudly presented to
                                </p>
                            </div>

                            <div className="w-100 d-flex justify-content-center position-relative mb-4">
                                <div style={{
                                    position: 'absolute',
                                    top: '65%', left: '15%', right: '15%',
                                    height: '1px', backgroundColor: '#b0b0b0', zIndex: -1
                                }}></div>
                                
                                <h2 style={{ 
                                    fontFamily: "'Alex Brush', cursive", 
                                    fontSize: '100px', 
                                    fontWeight: 'normal',
                                    color: '#1a1a1a',
                                    backgroundColor: '#F9F8F6', 
                                    padding: '0 40px',
                                    lineHeight: '1'
                                }}>
                                    {/* USING THE NEW JS FORMATTER HERE */}
                                    {formatName(certData.student_name)}
                                </h2>
                            </div>

                            <div className="mt-3">
                                <p style={{ 
                                    fontFamily: "'Montserrat', sans-serif", 
                                    fontStyle: 'italic',
                                    fontSize: '18px',
                                    fontWeight: 300,
                                    color: '#666',
                                    marginBottom: '15px'
                                }}>
                                    for successfully completing the professional training module
                                </p>
                                <h3 style={{
                                    fontFamily: "'Montserrat', sans-serif",
                                    fontSize: '22px',
                                    fontWeight: 600,
                                    color: '#2b2b2b',
                                    textTransform: 'uppercase',
                                    letterSpacing: '2px'
                                }}>
                                    {certData.course_title}
                                </h3>
                            </div>

                            <div className="mt-auto w-100 d-flex justify-content-between align-items-center px-5 pb-3">
                                
                                <div style={{ width: '250px', textAlign: 'center' }}>
                                    <div style={{ borderBottom: '1px solid #888', paddingBottom: '10px', marginBottom: '10px' }}>
                                        <p style={{ 
                                            fontFamily: "'Montserrat', sans-serif", 
                                            fontSize: '16px', 
                                            margin: 0,
                                            color: '#333'
                                        }}>
                                            {certData.issued_at}
                                        </p>
                                    </div>
                                    <p style={{ 
                                        fontFamily: "'Montserrat', sans-serif", 
                                        fontSize: '12px', 
                                        letterSpacing: '3px',
                                        color: '#777',
                                        textTransform: 'uppercase',
                                        margin: 0
                                    }}>
                                        Date
                                    </p>
                                </div>

                                <div style={{
                                    width: '130px', height: '130px',
                                    borderRadius: '50%', border: '1px solid #d4c4b7',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    padding: '10px', position: 'relative'
                                }}>
                                    <div style={{
                                        width: '100%', height: '100%', borderRadius: '50%', border: '1px dashed #b5a496',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
                                    }}>
                                        <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '2px', color: '#8c7b6d', textTransform: 'uppercase' }}>Certified</span>
                                        <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '24px', fontWeight: 'bold', color: '#8c7b6d', lineHeight: '1' }}>100%</span>
                                        <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '8px', color: '#a39487', marginTop: '4px' }}>ID: {certData.certificate_id.substring(0,8)}</span>
                                    </div>
                                </div>

                                <div style={{ width: '250px', textAlign: 'center' }}>
                                    <div style={{ borderBottom: '1px solid #888', paddingBottom: '10px', marginBottom: '10px' }}>
                                        <p style={{ 
                                            fontFamily: "'Alex Brush', cursive", 
                                            fontSize: '32px', 
                                            margin: 0,
                                            lineHeight: '0.6',
                                            color: '#333'
                                        }}>
                                            {formatName(certData.instructor)}
                                        </p>
                                    </div>
                                    <p style={{ 
                                        fontFamily: "'Montserrat', sans-serif", 
                                        fontSize: '12px', 
                                        letterSpacing: '3px',
                                        color: '#777',
                                        textTransform: 'uppercase',
                                        margin: 0
                                    }}>
                                        Lead Instructor
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default CertificateViewer;