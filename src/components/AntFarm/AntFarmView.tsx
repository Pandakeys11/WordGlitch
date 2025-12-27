'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AntEngine } from '@/lib/antFarm/antEngine';
import { AntFarm, Ant, FarmItem } from '@/types/antFarm';
import { getMarketplaceItem } from '@/lib/antFarm/marketplaceItems';
import {
  enablePixelPerfect,
  PIXEL_SIZE,
  PIXEL_COLORS,
} from '@/lib/antFarm/pixelArt';
import {
  drawSideViewBackground,
  drawSideViewTunnel,
  drawSideViewChamber,
  drawSideViewAnt,
  drawSideViewFoodSource,
} from '@/lib/antFarm/sideViewRendering';
import { updateAntPopulation } from '@/lib/antFarm/antPopulation';
import { FoodType } from '@/types/antFarm';
import styles from './AntFarmView.module.css';

interface AntFarmViewProps {
  farm: AntFarm;
  onFarmUpdate?: (farm: AntFarm) => void;
  onAntClick?: (ant: Ant) => void;
  interactive?: boolean;
}

interface TunnelAnimation {
  id: string;
  progress: number;
  points: { x: number; y: number }[];
  startTime: number;
}

export default function AntFarmView({
  farm,
  onFarmUpdate,
  onAntClick,
  interactive = true,
  selectedFoodType = 'water',
}: AntFarmViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<AntEngine | null>(null);
  const animationRef = useRef<number | null>(null);
  const [selectedAnt, setSelectedAnt] = useState<Ant | null>(null);
  const tunnelAnimationsRef = useRef<Map<string, TunnelAnimation>>(new Map());
  const lastTunnelCountRef = useRef(0);
  const lastChamberCountRef = useRef(0);
  const animationFrameRef = useRef(0);
  const antFacingRef = useRef<Map<string, 'left' | 'right'>>(new Map());
  const lastPopulationUpdateRef = useRef<number>(0);

  // Initialize engine and sync dimensions
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;

    // Sync farm layout dimensions with canvas
    const rect = container.getBoundingClientRect();
    const farmWidth = rect.width;
    const farmHeight = rect.height;

    // Update ant population based on player progress
    const updatedAnts = updateAntPopulation(farm.ants);
    
    // Update farm layout dimensions if they don't match
    const updatedFarm: AntFarm = {
      ...farm,
      ants: updatedAnts,
      layout: {
        ...farm.layout,
        width: farmWidth,
        height: farmHeight,
      },
    };
    
    if (onFarmUpdate) {
      onFarmUpdate(updatedFarm);
    }

    const engine = new AntEngine(updatedFarm);
    engineRef.current = engine;

    // Position ants in center area if they don't have positions (side view - spread vertically)
    updatedAnts.forEach(ant => {
      if (ant.x === 0 && ant.y === 0) {
        const centerX = farmWidth / 2;
        const centerY = farmHeight / 2;
        // Spread ants vertically in side view (like in a real ant farm)
        ant.x = centerX + (Math.random() - 0.5) * 50;
        ant.y = centerY + (Math.random() - 0.5) * 200;
      }
      // Initialize facing direction
      antFacingRef.current.set(ant.id, Math.random() > 0.5 ? 'right' : 'left');
    });

    lastTunnelCountRef.current = updatedFarm.layout.tunnels.length;
    lastChamberCountRef.current = updatedFarm.layout.chambers.length;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [farm, onFarmUpdate]);

  // Animation loop
  useEffect(() => {
    if (!engineRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Enable pixel-perfect rendering
    enablePixelPerfect(ctx);

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      animationFrameRef.current++;

      // Update engine
      let updatedAnts = engineRef.current!.update();
      const state = engineRef.current!.getState();

      // Update ant population based on player progress (check every 5 seconds)
      const now = Date.now();
      if (!lastPopulationUpdateRef.current || now - lastPopulationUpdateRef.current > 5000) {
        const populationUpdatedAnts = updateAntPopulation(updatedAnts);
        if (populationUpdatedAnts.length !== updatedAnts.length) {
          // Population changed, update ants and reinitialize engine
          updatedAnts = populationUpdatedAnts;
          // Position new ants
          updatedAnts.forEach(ant => {
            if (ant.x === 0 && ant.y === 0) {
              const centerX = canvas.width / 2;
              const centerY = canvas.height / 2;
              ant.x = centerX + (Math.random() - 0.5) * 50;
              ant.y = centerY + (Math.random() - 0.5) * 200;
            }
          });
          // Update engine with new ants
          const updatedFarm: AntFarm = {
            ...farm,
            ants: updatedAnts,
          };
          engineRef.current = new AntEngine(updatedFarm);
        }
        lastPopulationUpdateRef.current = now;
      }

      // Track new tunnels for gradual animation (realistic digging)
      if (state.tunnels.length > lastTunnelCountRef.current) {
        const newTunnels = state.tunnels.slice(lastTunnelCountRef.current);
        newTunnels.forEach(tunnel => {
          tunnelAnimationsRef.current.set(tunnel.id, {
            id: tunnel.id,
            progress: 0,
            points: tunnel.points,
            startTime: currentTime,
          });
        });
        lastTunnelCountRef.current = state.tunnels.length;
      }

      // Update existing tunnel animations (gradual appearance)
      tunnelAnimationsRef.current.forEach((anim, id) => {
        const tunnel = state.tunnels.find(t => t.id === id);
        if (tunnel) {
          // Update points if tunnel was extended
          anim.points = tunnel.points;
          // Gradually increase progress (tunnels appear slowly like real digging)
          const timeSinceStart = (currentTime - anim.startTime) / 1000;
          anim.progress = Math.min(1.0, timeSinceStart * 0.5); // Takes 2 seconds to fully appear
        } else {
          // Tunnel was removed
          tunnelAnimationsRef.current.delete(id);
        }
      });

      // Track new chambers
      if (state.chambers.length > lastChamberCountRef.current) {
        lastChamberCountRef.current = state.chambers.length;
      }

      // Update ant facing directions based on movement
      updatedAnts.forEach(ant => {
        if (ant.targetX !== undefined && ant.targetY !== undefined) {
          const facing = ant.targetX > ant.x ? 'right' : 'left';
          antFacingRef.current.set(ant.id, facing);
        }
      });

      // Draw
      draw(ctx, canvas.width, canvas.height, state, selectedAnt, updatedAnts, deltaTime);

      // Update farm if callback provided
      if (onFarmUpdate) {
        const updatedFarm: AntFarm = {
          ...farm,
          ants: updatedAnts,
          layout: {
            ...farm.layout,
            tunnels: state.tunnels,
            chambers: state.chambers,
          },
        };
        onFarmUpdate(updatedFarm);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [farm, selectedAnt, onFarmUpdate]);

  const draw = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: ReturnType<AntEngine['getState']>,
    selected: Ant | null,
    ants: Ant[],
    deltaTime: number
  ) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw side-view ant farm background (tank perspective)
    drawSideViewBackground(ctx, width, height, farm.layout.background);

    // Draw tunnels with gradual animation (realistic digging, side view)
    state.tunnels.forEach(tunnel => {
      const anim = tunnelAnimationsRef.current.get(tunnel.id);
      if (anim) {
        // Draw tunnel gradually appearing
        drawSideViewTunnel(ctx, { ...tunnel, points: anim.points }, anim.progress);
      } else {
        // Fully visible tunnel
        drawSideViewTunnel(ctx, tunnel, 1.0);
      }
    });

    // Draw chambers (side view)
    state.chambers.forEach(chamber => {
      drawSideViewChamber(ctx, chamber);
    });

    // Draw pheromone trails (subtle pixel dots)
    state.pheromones.forEach(pheromone => {
      const alpha = Math.min(0.6, pheromone.strength / 5);
      ctx.fillStyle = `rgba(255, 200, 0, ${alpha})`;
      const gridX = Math.floor(pheromone.x / PIXEL_SIZE) * PIXEL_SIZE;
      const gridY = Math.floor(pheromone.y / PIXEL_SIZE) * PIXEL_SIZE;
      ctx.fillRect(gridX, gridY, PIXEL_SIZE, PIXEL_SIZE);
    });

    // Draw food sources (water, sugar, boost)
    const foodSources = engineRef.current?.getFoodSources() || [];
    foodSources.forEach(food => {
      drawSideViewFoodSource(ctx, food);
    });

    // Draw items (pixel art style)
    farm.items.forEach(item => {
      drawPixelItem(ctx, item);
    });

    // Draw ants (side view profile)
    ants.forEach(ant => {
      const isSelected = selected && selected.id === ant.id;
      const facing = antFacingRef.current.get(ant.id) || 'right';
      drawSideViewAnt(
        ctx,
        ant,
        facing,
        animationFrameRef.current
      );
      
      // Selection highlight (pixel grid)
      if (isSelected) {
        const gridX = Math.floor(ant.x / PIXEL_SIZE) * PIXEL_SIZE;
        const gridY = Math.floor(ant.y / PIXEL_SIZE) * PIXEL_SIZE;
        ctx.strokeStyle = PIXEL_COLORS.WHITE;
        ctx.lineWidth = PIXEL_SIZE;
        ctx.strokeRect(
          gridX - PIXEL_SIZE * 4,
          gridY - PIXEL_SIZE * 4,
          PIXEL_SIZE * 8,
          PIXEL_SIZE * 8
        );
      }
    });
  };

  const drawPixelItem = (ctx: CanvasRenderingContext2D, item: FarmItem) => {
    const itemDef = getMarketplaceItem(item.itemId);
    if (!itemDef) return;

    const pixel = PIXEL_SIZE;
    const gridX = Math.floor(item.x / pixel) * pixel;
    const gridY = Math.floor(item.y / pixel) * pixel;

    ctx.save();
    
    if (itemDef.type === 'food_dispenser') {
      // Pixel art food dispenser (3x3 pixels)
      ctx.fillStyle = PIXEL_COLORS.ANT_BODY;
      ctx.fillRect(gridX - pixel, gridY - pixel, pixel * 3, pixel * 3);
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(gridX, gridY, pixel, pixel);
      
      // Pulsing effect
      const pulse = (Date.now() % 2000) / 2000;
      if (pulse > 0.5) {
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(gridX, gridY, pixel, pixel);
      }
    } else if (itemDef.type === 'chamber') {
      // Pixel art chamber item
      ctx.fillStyle = PIXEL_COLORS.CHAMBER;
      for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
          if (Math.abs(i) + Math.abs(j) <= 3) {
            ctx.fillRect(gridX + i * pixel, gridY + j * pixel, pixel, pixel);
          }
        }
      }
    } else {
      // Decoration (2x2 pixels)
      ctx.fillStyle = PIXEL_COLORS.ANT_BODY;
      ctx.fillRect(gridX - pixel, gridY - pixel, pixel * 2, pixel * 2);
    }

    ctx.restore();
  };

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !canvasRef.current || !engineRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check if clicked on an ant (pixel grid alignment)
    const state = engineRef.current.getState();
    const clickedAnt = state.ants.find(ant => {
      const gridX = Math.floor(ant.x / PIXEL_SIZE) * PIXEL_SIZE;
      const gridY = Math.floor(ant.y / PIXEL_SIZE) * PIXEL_SIZE;
      const clickGridX = Math.floor(x / PIXEL_SIZE) * PIXEL_SIZE;
      const clickGridY = Math.floor(y / PIXEL_SIZE) * PIXEL_SIZE;
      return Math.abs(gridX - clickGridX) < PIXEL_SIZE * 4 && 
             Math.abs(gridY - clickGridY) < PIXEL_SIZE * 4;
    });

    if (clickedAnt) {
      setSelectedAnt(clickedAnt);
      if (onAntClick) {
        onAntClick(clickedAnt);
      }
      // Feed ant on click
      clickedAnt.hunger = Math.max(0, clickedAnt.hunger - 20);
    } else {
      setSelectedAnt(null);
      // Add selected food type at click location
      const gridX = Math.floor(x / PIXEL_SIZE) * PIXEL_SIZE;
      const gridY = Math.floor(y / PIXEL_SIZE) * PIXEL_SIZE;
      engineRef.current.addFoodSource(gridX, gridY, 100, selectedFoodType);
    }
  }, [interactive, onAntClick]);

  const handleCanvasResize = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Ensure dimensions are multiples of pixel size for crisp rendering
    const pixel = PIXEL_SIZE;
    const width = Math.floor(rect.width / pixel) * pixel;
    const height = Math.floor(rect.height / pixel) * pixel;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      enablePixelPerfect(ctx);
    }
  }, []);

  useEffect(() => {
    handleCanvasResize();
    window.addEventListener('resize', handleCanvasResize);
    return () => window.removeEventListener('resize', handleCanvasResize);
  }, [handleCanvasResize]);

  return (
    <div className={styles.antFarmContainer}>
      <canvas
        ref={canvasRef}
        className={styles.antFarmCanvas}
        onClick={handleCanvasClick}
      />
      {selectedAnt && (
        <div className={styles.antInfo}>
          <div className={styles.antName}>{selectedAnt.name}</div>
          <div className={styles.antType}>{selectedAnt.type} - {selectedAnt.tier}</div>
          <div className={styles.antStats}>
            <div>Energy: {Math.round(selectedAnt.energy)}%</div>
            <div>Hunger: {Math.round(selectedAnt.hunger)}%</div>
            <div>Speed: {selectedAnt.stats.speed.toFixed(1)}x</div>
            <div>Stamina: {selectedAnt.stats.stamina.toFixed(1)}x</div>
          </div>
          {interactive && (
            <div className={styles.antActions}>
              <button onClick={() => {
                selectedAnt.hunger = Math.max(0, selectedAnt.hunger - 30);
                setSelectedAnt({ ...selectedAnt });
              }}>
                Feed
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
