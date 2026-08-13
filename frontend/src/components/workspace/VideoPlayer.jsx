import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const VideoPlayer = ({ activeLesson, initialTime = 0, isVIP = false, onTimeUpdate, onProgressUpdate, onEnded }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isBuffering, setIsBuffering] = useState(true);
    const [hasSeeked, setHasSeeked] = useState(false);

    const controlsTimeoutRef = useRef(null);

    useEffect(() => {
        setIsBuffering(true);
        setHasSeeked(false);
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
    }, [activeLesson?.id]);

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 2500);
    };

    const handleMouseLeave = () => {
        if (isPlaying) setShowControls(false);
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                if (!isVIP) onProgressUpdate(videoRef.current.currentTime);
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => console.log(err));
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const formatTime = (timeInSeconds) => {
        if (isNaN(timeInSeconds)) return "00:00";
        const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
        const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const current = videoRef.current.currentTime;
        const total = videoRef.current.duration;
        setCurrentTime(current);
        setProgress((current / total) * 100);
        // Removed onTimeUpdate(current) to prevent API spam!
        // We will only call onProgressUpdate when pausing or ending.
    };

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        if (videoRef.current) {
            videoRef.current.currentTime = pos * videoRef.current.duration;
        }
    };

    const handleCanPlay = () => {
        setIsBuffering(false);
        if (videoRef.current && !hasSeeked && !isVIP && initialTime > 0) {
            videoRef.current.currentTime = initialTime;
            setHasSeeked(true);
        }
    };

    return (
        <div 
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden group shadow-2xl border border-white/10"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => showControls && togglePlay()}
        >
            {isBuffering && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                    <p className="text-white/70 text-sm font-medium">Buffering secure stream...</p>
                </div>
            )}

            <video
                ref={videoRef}
                src={activeLesson?.video_url}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={(e) => setDuration(e.target.duration)}
                onCanPlay={handleCanPlay}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                onPause={() => {
                    if (videoRef.current && !isVIP) {
                        onProgressUpdate(videoRef.current.currentTime);
                    }
                }}
                onEnded={() => {
                    setIsPlaying(false);
                    setShowControls(true);
                    if (onEnded) onEnded();
                }}
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            />

            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-0 left-0 right-0 p-4 pt-16 bg-gradient-to-t from-black/90 to-transparent z-20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Scrubber */}
                        <div 
                            className="w-full h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer relative group/scrubber"
                            onClick={handleSeek}
                        >
                            <div 
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-full"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full scale-0 group-hover/scrubber:scale-100 transition-transform shadow-lg" />
                            </div>
                        </div>

                        {/* Controls Row */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button onClick={togglePlay} className="text-white hover:text-indigo-500 transition-colors">
                                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                                </button>
                                
                                <div className="flex items-center gap-2 text-white/90">
                                    <button onClick={toggleMute} className="hover:text-indigo-500 transition-colors">
                                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                    </button>
                                </div>
                                
                                <div className="text-white/80 text-sm font-medium tabular-nums">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button onClick={toggleFullscreen} className="text-white hover:text-indigo-500 transition-colors">
                                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VideoPlayer;
