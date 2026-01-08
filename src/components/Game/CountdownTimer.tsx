'use client';

import React, { useRef, useEffect } from 'react';
import styles from './CountdownTimer.module.css';
import { ColorPalette } from '@/lib/colorPalettes';

interface CountdownTimerProps {
    timeRemaining: number;
    totalTime?: number;
    palette: ColorPalette;
}

export default function CountdownTimer({
    timeRemaining,
    totalTime = 60,
    palette
}: CountdownTimerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const barRef = useRef<HTMLDivElement>(null);
    const previousTimeRef = useRef(timeRemaining);

    // Animate text updates smoothly
    useEffect(() => {
        if (textRef.current) {
            import('animejs').then((module) => {
                const anime = module.default || module;
                anime({
                    targets: { value: previousTimeRef.current },
                    value: timeRemaining,
                    round: 1,
                    duration: 900,
                    easing: 'linear',
                    update: function (anim: any) {
                        if (textRef.current) {
                            textRef.current.innerHTML = Math.ceil(Number(anim.animations[0].currentValue)).toString() + 's';
                        }
                    }
                });
                previousTimeRef.current = timeRemaining;
            });
        }
    }, [timeRemaining]);

    // Animate progress bar smoothly
    useEffect(() => {
        if (barRef.current && totalTime > 0) {
            import('animejs').then((module) => {
                const anime = module.default || module;
                const percentage = (timeRemaining / totalTime) * 100;
                anime({
                    targets: barRef.current,
                    width: `${percentage}%`,
                    backgroundColor: timeRemaining < 10 ? '#ef4444' : palette.uiColors.secondary,
                    easing: 'linear',
                    duration: 100
                });
            });
        }
    }, [timeRemaining, totalTime, palette]);

    return (
        <div className={styles.timerContainer}>
            <div className={styles.timerLabel}>Remaining</div>
            <div className={styles.timerWrapper}>
                <div className={styles.timerTrack}>
                    <div
                        ref={barRef}
                        className={styles.timerFill}
                        style={{ width: '100%', backgroundColor: palette.uiColors.secondary }}
                    />
                </div>
                <span ref={textRef} className={styles.timerValue} style={{ color: palette.uiColors.text }}>
                    {Math.ceil(timeRemaining)}s
                </span>
            </div>
        </div>
    );
}
