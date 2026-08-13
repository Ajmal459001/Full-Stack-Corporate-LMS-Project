import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api'; 
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { useTheme } from '../context/ThemeContext';
import { Loader2, ArrowLeft, Download, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

const CertificateViewer = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    
    const [certData, setCertData] = useState(null);
    const [error, setError] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    
    const certificateRef = useRef(null);

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                const res = await api.get(`/api/courses/certificate/${courseId}/`);
                setCertData(res.data);
            } catch (err) {
                if (err.response?.status === 403) {
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
                backgroundColor: '#000814',
                logging: false
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF('landscape', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeightTotal = pdf.internal.pageSize.getHeight();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            // Fill background to prevent white borders
            pdf.setFillColor(0, 8, 20); // #000814
            pdf.rect(0, 0, pdfWidth, pdfHeightTotal, 'F');

            // Center image vertically if there is any tiny gap
            const yOffset = (pdfHeightTotal - pdfHeight) / 2;
            pdf.addImage(imgData, 'JPEG', 0, yOffset, pdfWidth, pdfHeight);
            
            pdf.save(`${certData.student_name.replace(' ', '_')}_Certificate.pdf`);
            
        } catch (err) {
            console.error("Failed to generate PDF", err);
            setError("Failed to generate the PDF file.");
        } finally {
            setIsDownloading(false);
        }
    };

    const formatName = (name) => {
        if (!name) return "";
        return name.toLowerCase().split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    if (error) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Access Denied</h2>
            <p className="text-muted-foreground mb-8 max-w-md">{error}</p>
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-6 py-3 bg-secondary text-foreground hover:bg-secondary/80 rounded-xl font-bold transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
        </div>
    );
    
    if (!certData) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground font-medium">Locating credential record...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-black relative overflow-hidden py-12 flex flex-col">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
                    
                    .font-space { font-family: 'Space Grotesk', sans-serif; }
                    .font-inter { font-family: 'Inter', sans-serif; }

                    /* Brutalist Grid Background */
                    .bg-brutalist-grid {
                      background-color: #000814;
                      background-image: 
                        linear-gradient(rgba(255, 255, 255, 0.15) 1px, rgba(0, 0, 0, 0) 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.15) 1px, rgba(0, 0, 0, 0) 1px);
                      background-size: 150px 150px;
                      background-position: center center;
                    }
                    
                    /* Brutalist Glass Panels */
                    .brutalist-glass {
                      background: rgba(255, 255, 255, 0.02);
                      box-shadow: 20px 20px 60px rgba(0, 0, 0, 0.8);
                      border: 1px solid rgba(255, 255, 255, 0.05);
                    }
                    
                    .brutalist-glass-intense {
                      background: rgba(255, 255, 255, 0.1);
                      border: 1px solid rgba(255, 255, 255, 0.2);
                    }
                    
                    /* Hash Background Strings */
                    .hash-string {
                      position: absolute;
                      font-family: monospace;
                      color: rgba(255, 255, 255, 0.3);
                      font-size: 0.75rem;
                      white-space: nowrap;
                      pointer-events: none;
                      z-index: 0;
                      user-select: none;
                      letter-spacing: 0.2em;
                    }
                `}
            </style>
            
            {/* Cinematic Background for Certificate Page */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black -z-10" />

            <div className="container mx-auto px-4 max-w-6xl flex-1 flex flex-col items-center">
                
                {/* Header Actions */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full flex justify-between items-center mb-8" 
                    style={{ maxWidth: '1056px' }}
                >
                    <button 
                        onClick={() => navigate(`/course/${courseId}`)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md font-bold text-sm transition-all shadow-sm backdrop-blur-md"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Workspace
                    </button>
                    <button 
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md font-bold hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
                    >
                        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {isDownloading ? 'Generating High-Res PDF...' : 'Download Official PDF'}
                    </button>
                </motion.div>

                {/* Certificate Container (Scrollable horizontally on small screens) */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-full overflow-x-auto flex justify-center pb-8"
                >
                    {/* DO NOT TOUCH INTERNAL STYLES - CRITICAL FOR HTML2CANVAS */}
                    <div 
                        ref={certificateRef}
                        className="shadow-2xl flex-shrink-0 relative overflow-hidden bg-brutalist-grid font-inter text-white flex items-center justify-center" 
                        style={{ 
                            width: '1188px', 
                            height: '840px', 
                        }}
                    >
                        {/* Unconventional Giant Logo */}
                        <div className="absolute -bottom-20 -left-10 text-[600px] font-space font-black opacity-5 pointer-events-none z-0 leading-none select-none text-white">
                            S
                        </div>
                        
                        {/* Blockchain Hash Decorators */}
                        <div className="hash-string top-[5%] left-[2%] transform -rotate-90 origin-left">0x8f3c...9a12</div>
                        <div className="hash-string top-[90%] left-[2%]">tx: 0x4b219f8a3c</div>
                        <div className="hash-string top-[15%] right-[2%] transform rotate-90 origin-right">valid_signature: true</div>
                        <div className="hash-string bottom-[5%] right-[2%]">node_sync: [100%]</div>

                        {/* Certificate Container */}
                        <div className="relative w-full h-full flex items-center justify-center z-10">
                            {/* Massive Background Panel */}
                            <div className="absolute w-[120%] h-[60%] brutalist-glass -rotate-6 top-[20%] -left-[10%] z-10"></div>
                            
                            {/* Primary Foreground Panel */}
                            <div className="absolute w-[80%] h-[75%] brutalist-glass-intense z-20 flex flex-col justify-between p-16">
                                
                                {/* Header Section */}
                                <div className="flex justify-between items-start w-full">
                                    <div className="flex flex-col gap-2">
                                        <span className="font-inter text-xs tracking-[0.5em] uppercase text-white/50">SkillStream // System</span>
                                        <h1 className="font-space text-5xl font-black tracking-tighter uppercase text-white leading-none">
                                            Certificate<br/><span className="text-white/30">Completion</span>
                                        </h1>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-sm text-white/40 mb-1">{certData.issued_at}</p>
                                        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/30">Timestamp</p>
                                    </div>
                                </div>

                                {/* Body Section (Name & Course) */}
                                <div className="flex flex-col w-full z-30 mt-12">
                                    <p className="font-mono text-xs text-white/40 tracking-widest uppercase mb-4">
                                        Verified issue to:
                                    </p>
                                    {/* Brutalist Typography for Name */}
                                    <h2 className="font-space text-[90px] leading-[0.9] text-white font-bold tracking-tighter whitespace-nowrap overflow-visible">
                                        {formatName(certData.student_name)}
                                    </h2>
                                    <div className="flex items-center gap-8 mt-12">
                                        <div className="h-[1px] w-32 bg-white/30"></div>
                                        <h3 className="font-space text-3xl tracking-widest uppercase font-bold text-white/90">
                                            {certData.course_title}
                                        </h3>
                                        <p className="font-mono text-[10px] text-white/30 tracking-widest max-w-xs">
                                            &gt; successfully executed module_completion.sh --target
                                        </p>
                                    </div>
                                </div>

                                {/* Footer Section */}
                                <div className="w-full flex items-end justify-between mt-auto pt-8 border-t border-white/10">
                                    {/* Brutalist Seal */}
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 bg-white text-[#000814] flex flex-col items-center justify-center font-bold">
                                            <span className="text-[10px] tracking-widest uppercase mb-1">Verified</span>
                                            <span className="text-3xl leading-none">100%</span>
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <span className="font-mono text-xs text-white/50 tracking-widest">HASH</span>
                                            <span className="font-mono text-sm text-white font-bold">{certData.certificate_id.substring(0, 10).toUpperCase()}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Signature */}
                                    <div className="flex flex-col items-end gap-1">
                                        <p className="font-space italic text-4xl text-white font-bold tracking-tighter">{formatName(certData.instructor)}</p>
                                        <p className="font-mono text-[10px] text-white/40 tracking-[0.4em] uppercase">Lead_Instructor</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Foreground Overlay Panel */}
                            <div className="absolute w-[40%] h-[120%] brutalist-glass right-[5%] top-[-10%] z-30 pointer-events-none opacity-50"></div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CertificateViewer;