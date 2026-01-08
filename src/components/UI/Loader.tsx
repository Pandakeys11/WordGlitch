'use client';

import React, { useEffect, useState } from 'react';



interface LoaderProps {
    size?: number | string;
    color?: string;
    type?: 'hatch' | 'tailspin' | 'waveform';
    stroke?: number | string;
    speed?: number | string;
}

export default function Loader({
    size = 40,
    color = 'white',
    type = 'hatch',
    stroke,
    speed
}: LoaderProps) {
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        const registerLoaders = async () => {
            try {
                const { hatch, tailspin, waveform } = await import('ldrs');
                hatch.register();
                tailspin.register();
                waveform.register();
                setIsRegistered(true);
            } catch (e) {
                console.error('Failed to register ldrs:', e);
            }
        };
        registerLoaders();
    }, []);

    if (!isRegistered) return null; // or a fallback div

    if (type === 'tailspin') {
        return (
            <l-tailspin
                size={size}
                color={color}
                stroke={stroke || "5"}
                speed={speed || "0.9"}
            />
        );
    }

    if (type === 'waveform') {
        return (
            <l-waveform
                size={size}
                color={color}
                stroke={stroke || "3.5"}
                speed={speed || "1.0"}
            />
        );
    }

    // Default to hatch
    return (
        <l-hatch
            size={size}
            color={color}
            stroke={stroke || "4"}
            speed={speed || "3.5"}
        />
    );
}
