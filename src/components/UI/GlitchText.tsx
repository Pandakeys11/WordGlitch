'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ColorPalette } from '@/lib/colorPalettes';

interface GlitchTextProps {
    text: string;
    palette: ColorPalette;
    className?: string;
    as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
    glitchIntensity?: 'low' | 'medium' | 'high';
    preserveSpaces?: boolean;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789Ω';

export default function GlitchText({
    text,
    palette,
    className = '',
    as: Component = 'div',
    glitchIntensity = 'low',
    preserveSpaces = true,
}: GlitchTextProps) {
    const [displayText, setDisplayText] = useState(text.split(''));
    const originalText = useRef(text.split(''));
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isHovered = useRef(false);

    // Update original text when prop changes
    useEffect(() => {
        originalText.current = text.split('');
        setDisplayText(text.split(''));
    }, [text]);

    const glitchChar = useCallback((index: number) => {
        if (preserveSpaces && originalText.current[index] === ' ') return;

        setDisplayText(prev => {
            const newText = [...prev];
            newText[index] = CHARS[Math.floor(Math.random() * CHARS.length)];
            return newText;
        });

        // Revert back quickly
        setTimeout(() => {
            if (!isHovered.current) {
                setDisplayText(prev => {
                    const newText = [...prev];
                    newText[index] = originalText.current[index];
                    return newText;
                });
            }
        }, 100);
    }, [preserveSpaces]);

    useEffect(() => {
        const intensityMap = {
            low: 0.05,
            medium: 0.15,
            high: 0.3,
        };

        const runGlitch = () => {
            const chance = Math.random();
            const threshold = isHovered.current ? 0.4 : intensityMap[glitchIntensity];

            if (chance < threshold) {
                const indicesToGlitch = Math.floor(Math.random() * 3) + 1;
                for (let i = 0; i < indicesToGlitch; i++) {
                    const idx = Math.floor(Math.random() * originalText.current.length);
                    glitchChar(idx);
                }
            }
        };

        intervalRef.current = setInterval(runGlitch, 100);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [glitchIntensity, glitchChar]);

    const handleMouseEnter = () => {
        isHovered.current = true;
        // Trigger intense glitch on hover
        const intenseInterval = setInterval(() => {
            if (!isHovered.current) {
                clearInterval(intenseInterval);
                return;
            }
            setDisplayText(prev => {
                return prev.map((char, i) => {
                    if (preserveSpaces && originalText.current[i] === ' ') return ' ';
                    return Math.random() > 0.7
                        ? CHARS[Math.floor(Math.random() * CHARS.length)]
                        : originalText.current[i];
                });
            });
        }, 50);
    };

    const handleMouseLeave = () => {
        isHovered.current = false;
        // Reset to original text
        setDisplayText(originalText.current);
    };

    return (
        <Component
            className={className}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            aria-label={text} // Accessibility
            style={{
                display: 'inline-block', // Ensure transformations work well
                cursor: 'default',
            }}
        >
            {displayText.map((char, idx) => (
                <span
                    key={idx}
                    style={{
                        display: 'inline-block',
                        color: char === originalText.current[idx]
                            ? undefined // Inherit color
                            : palette.uiColors.primary, // Glitch color
                        textShadow: char !== originalText.current[idx]
                            ? `0 0 5px ${palette.uiColors.primary}`
                            : undefined,
                        transition: 'color 0.1s',
                    }}
                >
                    {char}
                </span>
            ))}
        </Component>
    );
}
