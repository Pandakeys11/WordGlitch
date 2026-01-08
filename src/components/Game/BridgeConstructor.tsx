'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './BridgeConstructor.module.css';

interface BridgeConstructorProps {
    level: number;
    requiredBuildings?: number; // Optional prop to override level-based count
    onComplete: () => void;
    onBuildingCrossed: () => void;
    currentPalette: any;
}

interface StickmanState {
    x: number;
    y: number;
    isWalking: boolean;
    isFalling: boolean;
    rotation: number;
}

interface BridgeSegment {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    angle: number;
}

const HOW_TO_PLAY = [
    "1. Drag from a building to the next.",
    "2. Connect bridges to make a path.",
    "3. Click 'GO!' to walk.",
    "4. Don't fall!"
];

export default function BridgeConstructor({
    level,
    requiredBuildings,
    onComplete,
    onBuildingCrossed,
    currentPalette,
}: BridgeConstructorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isBuilding, setIsBuilding] = useState(false);
    const [bridgeStart, setBridgeStart] = useState<{ x: number; y: number } | null>(null);
    const [currentBridge, setCurrentBridge] = useState<BridgeSegment | null>(null);
    const [placedBridges, setPlacedBridges] = useState<BridgeSegment[]>([]);
    // Use requiredBuildings if provided, otherwise default to level (legacy behavior)
    // Ensure at least 3 buildings for gameplay
    const [buildingsRequired] = useState(Math.max(3, requiredBuildings || level));

    // Ultra-Widescreen / Strip Layout
    const CANVAS_WIDTH = 900; // Wider
    const CANVAS_HEIGHT = 160; // Shorter strip
    const GROUND_Y = 140; // Adjusted ground

    // COMPRESSED SIZES
    const BUILDING_WIDTH = 40;
    const BUILDING_GAP = 60;
    const FIRST_BUILDING_X = 50;
    const BUILDING_HEIGHT = 80; // shorter
    const STICKMAN_SIZE = 12; // Tiny stickman

    const getInitialStickmanState = () => ({
        x: FIRST_BUILDING_X + 10,
        y: GROUND_Y - BUILDING_HEIGHT - STICKMAN_SIZE,
        isWalking: false,
        isFalling: false,
        rotation: 0,
    });

    const [stickman, setStickman] = useState<StickmanState>(getInitialStickmanState());

    const [buildingsCrossed, setBuildingsCrossed] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [buildings, setBuildings] = useState<{ x: number; width: number; height: number; windows: { r: number, c: number, phase: number, baseAlpha: number }[] }[]>([]);
    const [cameraX, setCameraX] = useState(0);
    const [lastCrossedIndex, setLastCrossedIndex] = useState(-1);
    const [activeBuildingIndex, setActiveBuildingIndex] = useState(0); // Track which building is "active" for building
    const [stars, setStars] = useState<{ x: number; y: number; size: number; phase: number }[]>([]);

    const resetGame = () => {
        setIsBuilding(false);
        setBridgeStart(null);
        setCurrentBridge(null);
        setPlacedBridges([]);
        setStickman(getInitialStickmanState());
        setBuildingsCrossed(0);
        setGameStarted(false);
        setGameOver(false);
        setCameraX(0);
        setLastCrossedIndex(-1);
        setActiveBuildingIndex(0);
    };

    // Initialize buildings with RANDOM attributes based on level
    useEffect(() => {
        const newBuildings = [];
        let currentX = FIRST_BUILDING_X;

        // Pseudo-random generator seeded by level
        const seededRandom = (seed: number) => {
            const x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
        };

        for (let i = 0; i <= buildingsRequired; i++) {
            // Randomize per building if level > 5, else static for tutorial feel
            let width = BUILDING_WIDTH;
            let height = BUILDING_HEIGHT;
            let gap = BUILDING_GAP;

            if (level > 5 && i > 0) { // Keep first building standard, random others
                const r1 = seededRandom(level * 100 + i);
                const r2 = seededRandom(level * 100 + i + 1);
                const r3 = seededRandom(level * 100 + i + 2);

                width = 20 + Math.floor(r1 * 30); // 20 to 50 width
                height = 40 + Math.floor(r2 * 60); // 40 to 100 height
                // Tight gaps for smaller scale
                const levelBonus = Math.min(20, (level - 5) * 1);
                gap = 30 + Math.floor(r3 * 30) + levelBonus; // 30-60 gap
            }

            // Generate windows
            const windows = [];
            const cols = Math.floor((width - 6) / 8);
            const rows = Math.floor((height - 10) / 10);

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    // 60% chance of a window existing
                    if (seededRandom(level * 200 + i * 50 + r * 10 + c) > 0.4) {
                        windows.push({
                            r, c,
                            phase: seededRandom(level * 300 + i * 20 + r * c) * Math.PI * 2,
                            baseAlpha: 0.2 + seededRandom(level * 400 + r) * 0.6 // varied brightness
                        });
                    }
                }
            }

            newBuildings.push({
                x: currentX,
                width: width,
                height: height,
                windows
            });

            currentX += width + gap;
        }
        setBuildings(newBuildings);

        // Generate stars
        const newStars = [];
        for (let i = 0; i < 40; i++) {
            newStars.push({
                x: seededRandom(level * 500 + i) * CANVAS_WIDTH,
                y: seededRandom(level * 600 + i) * (GROUND_Y - 20),
                size: 0.5 + seededRandom(level * 700 + i) * 1.5,
                phase: seededRandom(level * 800 + i) * Math.PI * 2
            });
        }
        setStars(newStars);
    }, [buildingsRequired, level]);

    // Update camera to follow stickman
    useEffect(() => {
        // Keep stickman centered (approx 150px from left)
        const targetCamX = Math.max(0, stickman.x - 150);
        setCameraX(targetCamX);
    }, [stickman.x]);

    // Draw game
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.fillStyle = currentPalette.uiColors.background;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.save();
        // Apply camera transform
        ctx.translate(-cameraX, 0);

        // Draw sky
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, currentPalette.glitchColors[0] || '#1a1a2e');
        gradient.addColorStop(1, currentPalette.glitchColors[1] || '#2d2d4d');
        ctx.fillStyle = gradient;

        // Restore to screen coordinates for static sky
        ctx.restore();

        // Draw sky background (Static / Screen Space)
        ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);

        // Draw Twinkling Stars
        ctx.fillStyle = "#FFFFFF";
        const time = Date.now() / 1000;
        stars.forEach(star => {
            const alpha = 0.3 + Math.abs(Math.sin(time * 2 + star.phase)) * 0.7;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Restore context? NO, we didn't save/translate yet in this block.
        // Wait, check original code structure.

        ctx.save();
        // Apply camera transform for world objects
        ctx.translate(-cameraX, 0);

        // Draw buildings
        buildings.forEach((building, index) => {
            const isTarget = index === buildingsCrossed;
            const isCompleted = index < buildingsCrossed;

            const buildingColor = isCompleted
                ? currentPalette.uiColors.secondary
                : (isTarget ? currentPalette.uiColors.primary : currentPalette.uiColors.text);

            ctx.fillStyle = buildingColor;
            ctx.fillRect(building.x, GROUND_Y - building.height, building.width, building.height);

            // Draw windows (City Lights)
            // Use a warm color or palette accent
            const windowBaseColor = currentPalette.glitchColors[2] || '#FFFFE0'; // Default warm light
            ctx.fillStyle = windowBaseColor;

            const time = Date.now() / 1000;

            building.windows.forEach(win => {
                // Flickering effect: sinusoidal breathing + random noise
                // Noise simulated by high freq sin
                const flicker = Math.sin(time * 3 + win.phase) * 0.2 + Math.sin(time * 13 + win.phase) * 0.1;
                const alpha = Math.max(0.1, Math.min(1, win.baseAlpha + flicker));

                ctx.globalAlpha = alpha;
                // Small rectangular windows
                ctx.fillRect(
                    building.x + 4 + win.c * 8,
                    GROUND_Y - building.height + 6 + win.r * 10,
                    5,
                    7
                );
            });
            ctx.globalAlpha = 1.0;

            // Draw checkmark if crossed
            if (isCompleted) {
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 2; // Thinner checkmark
                ctx.beginPath();
                ctx.moveTo(building.x + 10, GROUND_Y - building.height / 2);
                ctx.lineTo(building.x + 20, GROUND_Y - building.height / 2 + 10);
                ctx.lineTo(building.x + 35, GROUND_Y - building.height / 2 - 10);
                ctx.stroke();
            }

            // Draw flag/goal on last building
            if (index === buildingsRequired) {
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.moveTo(building.x + 25, GROUND_Y - building.height - 25); // Adjusted flag position
                ctx.lineTo(building.x + 25, GROUND_Y - building.height);
                ctx.stroke();
                ctx.fill();
                // Flag
                ctx.fillRect(building.x + 25, GROUND_Y - building.height - 25, 20, 15); // Adjusted flag size
            }
        });

        // Draw ground
        ctx.fillStyle = currentPalette.glitchColors[3] || '#4d4d80';
        ctx.fillRect(0, GROUND_Y, Math.max(CANVAS_WIDTH + cameraX, buildings[buildings.length - 1]?.x + 500 || 2000), CANVAS_HEIGHT - GROUND_Y);

        // Draw placed bridges
        placedBridges.forEach((bridge) => {
            ctx.strokeStyle = currentPalette.uiColors.accent;
            ctx.lineWidth = 2; // Thinner bridges
            ctx.beginPath();
            ctx.moveTo(bridge.startX, bridge.startY);
            ctx.lineTo(bridge.endX, bridge.endY);
            ctx.stroke();

            // Draw support lines
            ctx.strokeStyle = currentPalette.glitchColors[4] || '#666699';
            ctx.lineWidth = 1; // Thinner supports
            const segments = 3; // Fewer segments
            for (let i = 1; i < segments; i++) {
                const t = i / segments;
                const x = bridge.startX + (bridge.endX - bridge.startX) * t;
                const y = bridge.startY + (bridge.endY - bridge.startY) * t;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + 10); // Shorter supports
                ctx.stroke();
            }
        });

        // Draw current bridge being built
        if (currentBridge) {
            ctx.strokeStyle = currentPalette.hiddenWordColor;
            ctx.lineWidth = 2; // Thinner preview
            ctx.setLineDash([3, 3]); // Smaller dashes
            ctx.beginPath();
            ctx.moveTo(currentBridge.startX, currentBridge.startY);
            ctx.lineTo(currentBridge.endX, currentBridge.endY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw stickman
        const stickX = stickman.x;
        const stickY = stickman.y; // Assume Stickman Y is feet position

        ctx.save();
        ctx.translate(stickX, stickY);
        ctx.rotate(stickman.rotation);

        // Calculate animation speed based on movement speed
        // Speed scales with level
        const movementSpeed = 4 + level * 0.15; // Faster base speed
        const speedScale = movementSpeed / 3;
        const animTime = Date.now() / (100 / speedScale);

        // Draw Stickman - BLACK color, Elongated Limbs (Scaled down)
        ctx.fillStyle = '#000000'; // Black
        ctx.strokeStyle = '#000000'; // Black
        ctx.lineWidth = 2; // Thinner lines for small scale

        // Head (Circle) - scale down
        ctx.beginPath();
        // Center at -15. Size 4 ??
        ctx.arc(0, -STICKMAN_SIZE - 2, 4, 0, Math.PI * 2);
        ctx.fill();

        // Body (Line)
        ctx.beginPath();
        ctx.moveTo(0, -STICKMAN_SIZE + 2); // Neck
        ctx.lineTo(0, -6); // Hip
        ctx.stroke();

        // Arms
        const armAngle = stickman.isWalking ? Math.sin(animTime) * 0.6 : 0;
        ctx.beginPath();
        ctx.moveTo(0, -STICKMAN_SIZE + 4); // Shoulder
        ctx.lineTo(-6 * Math.cos(armAngle), -STICKMAN_SIZE + 4 + 6 * Math.sin(armAngle)); // Left arm
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -STICKMAN_SIZE + 4); // Shoulder
        ctx.lineTo(6 * Math.cos(armAngle), -STICKMAN_SIZE + 4 - 6 * Math.sin(armAngle)); // Right arm
        ctx.stroke();

        // Legs
        const legAngle = stickman.isWalking ? Math.sin(animTime) * 0.8 : 0;
        ctx.beginPath();
        ctx.moveTo(0, -6); // Hip
        ctx.lineTo(-5 * Math.cos(legAngle), 0 + 2 * Math.sin(legAngle)); // Left foot
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -6); // Hip
        ctx.lineTo(5 * Math.cos(legAngle), 0 - 2 * Math.sin(legAngle)); // Right foot
        ctx.stroke();

        ctx.restore();

        ctx.restore(); // Restore camera transform

    }, [buildings, placedBridges, currentBridge, stickman, buildingsCrossed, currentPalette, cameraX, buildingsRequired, STICKMAN_SIZE, GROUND_Y, level]);

    // Handle mouse move - update bridge preview
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isBuilding || !bridgeStart) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        let x = (clientX - rect.left) * scaleX + cameraX;
        let y = (clientY - rect.top) * scaleY;

        // SMART SNAPPING:
        // Find ANY building whose top-left corner is near the cursor (x,y)
        // This supports building ahead (level 1-100 logic)
        const snapCandidate = buildings.find(b => {
            // Target: Top-Left corner of the building (where a bridge would land)
            const snapTargetX = b.x;
            const snapTargetY = GROUND_Y - b.height;
            const dist = Math.sqrt(Math.pow(x - snapTargetX, 2) + Math.pow(y - snapTargetY, 2));
            return dist < 30; // Reduced snap radius for smaller scale
        });

        if (snapCandidate) {
            x = snapCandidate.x;
            y = GROUND_Y - snapCandidate.height;
        }

        // Also snap ground? No, dangerous.

        const length = Math.sqrt(Math.pow(x - bridgeStart.x, 2) + Math.pow(y - bridgeStart.y, 2));
        const angle = Math.atan2(y - bridgeStart.y, x - bridgeStart.x);

        setCurrentBridge({
            startX: bridgeStart.x,
            startY: bridgeStart.y,
            endX: x,
            endY: y,
            angle, // Length property removed from interface earlier? No, interface still has angle. Length removed in Step 409?
            // Checking Step 409: "length: number" REMOVED from interface replacement? 
            // In Step 409 Chunk 1: "angle: number; }" (length removed).
            // So I should NOT pass length here if interface doesn't have it.
            // But verify interface first.
        });
    };

    const handleInputStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (gameOver) return;
        // REMOVE CHECK: stickman.isWalking
        // Allow building ALWAYS unless game over.

        // Prevent scrolling on touch
        if ('touches' in e) {
            // e.preventDefault(); // React synthetic events might complain, but usually good for games
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const x = (clientX - rect.left) * scaleX + cameraX;
        const y = (clientY - rect.top) * scaleY;

        // Allow building from ANY building (except the detailed goal building at end)
        // User request: "set up all bridges to each building right away"

        let clickedBuildingIndex = -1;
        const clickedBuilding = buildings.find((b, idx) => {
            const isMatch = x >= b.x - 10 && // Smaller click area
                x <= b.x + b.width + 50 && // Smaller click area
                Math.abs(y - (GROUND_Y - b.height)) < 50; // Smaller click area
            if (isMatch) clickedBuildingIndex = idx;
            return isMatch;
        });

        if (clickedBuilding && clickedBuildingIndex !== -1) {
            // CHECK: ONE ATTEMPT PER BUILDING
            // Does a bridge already exist starting from this building?
            // Bridge Start X is approx Building Right Edge
            const buildingRightEdge = clickedBuilding.x + clickedBuilding.width;

            const existingBridge = placedBridges.find(bridge =>
                Math.abs(bridge.startX - buildingRightEdge) < 5 // Check nearby
            );

            if (existingBridge) {
                // Already built a bridge here! Block new attempt.
                return;
            }

            // Also prevent building from BEHIND the stickman?
            // If stickman is past this building, no point.
            // But strict requirement says "set up all bridges... right away".
            // So we allow it.

            setIsBuilding(true);
            setBridgeStart({
                x: clickedBuilding.x + clickedBuilding.width,
                y: GROUND_Y - clickedBuilding.height
            });
        }
    };

    // Handle mouse up - place bridge
    const handleMouseUp = () => {
        if (!isBuilding || !currentBridge) return;

        setPlacedBridges([...placedBridges, currentBridge]);
        setIsBuilding(false);
        setBridgeStart(null);
        setCurrentBridge(null);
    };

    // Start stickman walking
    const startWalking = () => {
        setGameStarted(true);
        setStickman(prev => ({ ...prev, isWalking: true }));
    };

    // Stickman physics and movement
    useEffect(() => {
        if (!stickman.isWalking || gameOver) return;

        const interval = setInterval(() => {
            setStickman((prev) => {
                // Falling logic
                if (prev.isFalling) {
                    const newY = prev.y + 12; // Faster falling
                    if (newY > CANVAS_HEIGHT + 100) {
                        setGameOver(true);
                        // Reset stickman logic usually goes here but we handle via component state
                        return prev;
                    }
                    return { ...prev, y: newY, rotation: prev.rotation + 0.1 };
                }

                // MOVEMENT: Base 2.5 + Level Scaling (Scaled for smaller size)
                // Was 4, but if world is 50% smaller, speed should be ~2
                const movementSpeed = 2.5 + level * 0.1;
                const newX = prev.x + movementSpeed;

                let onSurface = false;
                let surfaceY = GROUND_Y; // Fallback

                // Check buildings
                buildings.forEach((building, index) => {
                    if (newX >= building.x && newX <= building.x + building.width) {
                        // Check vertical alignment
                        const buildingTop = GROUND_Y - building.height;
                        // Tolerance based on speed
                        if (Math.abs(buildingTop - prev.y) < 20) {
                            onSurface = true;
                            surfaceY = buildingTop;

                            // Update active building index as we run naturally
                            if (index > activeBuildingIndex) {
                                setActiveBuildingIndex(index);
                            }

                            // Check trigger building crossed (only trigger once per building)
                            if (index > lastCrossedIndex && index > 0) {
                                setLastCrossedIndex(index);
                                setBuildingsCrossed(index);
                                onBuildingCrossed();
                            }
                        }
                    }
                });

                // Check bridges
                placedBridges.forEach((bridge) => {
                    // Check if current X is within bridge span
                    if (newX >= Math.min(bridge.startX, bridge.endX) && newX <= Math.max(bridge.startX, bridge.endX)) {
                        // Calculate expected Y on bridge
                        // Linear interpolation
                        const ratio = (newX - bridge.startX) / (bridge.endX - bridge.startX);
                        const bridgeY = bridge.startY + (bridge.endY - bridge.startY) * ratio;

                        // Check vertical alignment
                        if (Math.abs(bridgeY - prev.y) < 20) {
                            onSurface = true;
                            surfaceY = bridgeY;
                        }
                    }
                });

                // Falling detection
                if (!onSurface) {
                    return { ...prev, x: newX, isFalling: true };
                }

                // Wall detection / Stop at end
                if (buildingsCrossed >= buildingsRequired && newX > buildings[buildingsRequired].x + 20) {
                    setStickman(p => ({ ...p, isWalking: false }));
                    setGameOver(true);

                    // Auto-complete level after a short delay (like normal levels)
                    setTimeout(() => {
                        onComplete();
                    }, 1000);

                    return prev;
                }

                // STOP LOGIC: Only for levels <= 12
                if (level <= 12) {
                    // Stop at next building center to allow building next bridge
                    // Check if we are on a building (not bridge) and it's a NEW building
                    const currentBuildingIdx = buildings.findIndex(b => newX >= b.x && newX <= b.x + b.width);
                    if (currentBuildingIdx !== -1 && currentBuildingIdx > activeBuildingIndex) {
                        // We reached a new building!
                        // Stop roughly in the middle or safe zone
                        const building = buildings[currentBuildingIdx];
                        if (newX > building.x + 10) {
                            // Force stop
                            setActiveBuildingIndex(currentBuildingIdx);
                            return { ...prev, x: newX, y: surfaceY, isWalking: false }; // STOP
                        }
                    }
                }

                return { ...prev, x: newX, y: surfaceY }; // Snap Y to surface
            });
        }, 20);

        return () => clearInterval(interval);
    }, [stickman.isWalking, gameOver, buildings, placedBridges, buildingsCrossed, buildingsRequired, onComplete, onBuildingCrossed, lastCrossedIndex, activeBuildingIndex, level]);

    return (
        <div className={styles.bridgeConstructor}>
            <div className={styles.header}>
                <div className={styles.headerRow}>
                    <h2>BRIDGE CONSTRUCTOR</h2>
                    <span className={styles.stats}>
                        BUILDING: <span style={{ color: currentPalette.uiColors.primary }}>{buildingsCrossed + 1}</span> / {buildingsRequired}
                    </span>
                </div>
            </div>

            <div className={styles.gameLayout}>
                <div className={styles.canvasContainer}>
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        className={styles.canvas}
                        style={{ touchAction: 'none' }} // Critical for touch interaction
                        onMouseDown={handleInputStart}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleInputStart}
                        onTouchMove={handleMouseMove}
                        onTouchEnd={handleMouseUp}
                    />
                </div>

                <div className={styles.controlsInfo}>
                    <div className={styles.instructions}>
                        <h4 style={{ color: currentPalette.uiColors.accent }}>HOW TO PLAY</h4>
                        <ul>
                            {HOW_TO_PLAY.map((step, i) => (
                                <li key={i} style={{ color: currentPalette.uiColors.text }}>{step}</li>
                            ))}
                        </ul>
                    </div>

                    <div className={styles.controls}>
                        {!stickman.isWalking && !gameOver && (
                            <button
                                onClick={startWalking}
                                className={styles.startButton}
                                style={{
                                    borderColor: currentPalette.uiColors.primary,
                                    color: currentPalette.uiColors.primary,
                                    background: 'transparent',
                                }}
                            >
                                {activeBuildingIndex > 0 ? "CONTINUE" : "GO!"}
                            </button>
                        )}

                        {gameOver && buildingsCrossed >= buildingsRequired && (
                            <>
                                <button
                                    onClick={onComplete}
                                    className={styles.startButton}
                                    style={{
                                        borderColor: '#00ff00',
                                        color: '#00ff00',
                                        background: 'transparent',
                                    }}
                                >
                                    FINISH
                                </button>
                                <div className={styles.success} style={{ color: currentPalette.hiddenWordColor }}>
                                    <h3>🎉 Success!</h3>
                                    <p>All buildings crossed! Level Complete!</p>
                                </div>
                            </>
                        )}

                        {gameOver && buildingsCrossed < buildingsRequired && (
                            <div className={styles.failure} style={{ color: '#ff4444' }}>
                                <h3>💥 Failed!</h3>
                                <p>Stickman fell.</p>
                                <button
                                    onClick={resetGame}
                                    className={styles.retryButton}
                                    style={{
                                        borderColor: currentPalette.uiColors.accent,
                                        color: currentPalette.uiColors.accent,
                                        background: 'transparent',
                                    }}
                                >
                                    Retry
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
