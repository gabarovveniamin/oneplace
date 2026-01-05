import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';

interface ModernAudioPlayerProps {
    url: string;
    isMe: boolean;
}

export function ModernAudioPlayer({ url, isMe }: ModernAudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Генерируем фиксированный паттерн волны
    const barsCount = 35;
    const bars = useRef(Array.from({ length: barsCount }, () =>
        0.2 + (Math.random() * 0.7)
    ));

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            if (audio.duration) {
                setCurrentTime(audio.currentTime);
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleLoadedMetadata = () => {
            if (audio.duration) setDuration(audio.duration);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(err => console.error("Audio error", err));
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return '0:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        if (!audio || !audio.duration) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        audio.currentTime = percentage * audio.duration;
    };

    const activeColor = isMe ? '#ffffff' : '#3390ec';
    const inactiveColor = isMe ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.15)';

    return (
        <div className="flex items-center gap-3 py-1 select-none min-w-[220px] max-w-full">
            <audio ref={audioRef} src={url} crossOrigin="anonymous" preload="metadata" />

            <button
                onClick={togglePlay}
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm
          ${isMe ? 'bg-white text-[#3390ec]' : 'bg-[#3390ec] text-white'}`}
            >
                {isPlaying ? (
                    <Pause size={18} fill="currentColor" />
                ) : (
                    <Play size={20} fill="currentColor" className="ml-1" />
                )}
            </button>

            <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
                {/* WAVEFORM - Использование явных пикселей для высоты */}
                <div
                    className="h-[24px] flex items-center gap-[2px] cursor-pointer"
                    onClick={handleSeek}
                >
                    {bars.current.map((h, i) => {
                        const barPos = (i / barsCount) * 100;
                        const isFilled = progress >= barPos;
                        const pixelHeight = Math.max(4, Math.round(h * 24));

                        return (
                            <div
                                key={i}
                                className="w-[3px] rounded-full transition-colors duration-200"
                                style={{
                                    height: pixelHeight + 'px',
                                    backgroundColor: isFilled ? activeColor : inactiveColor
                                }}
                            />
                        );
                    })}
                </div>

                <div className="flex items-center gap-1.5 leading-none">
                    <span className={`text-[11px] font-medium tabular-nums ${isMe ? 'text-white/90' : 'text-[#3390ec]'}`}>
                        {formatTime(isPlaying ? currentTime : duration)}
                    </span>
                    <div className={`w-[2px] h-[2px] rounded-full ${isMe ? 'bg-white/40' : 'bg-[#aaaaaa]/40'}`} />
                    <span className={`text-[11px] font-normal ${isMe ? 'text-white/60' : 'text-black/40'}`}>
                        voice message
                    </span>
                </div>
            </div>
        </div>
    );
}
