'use client';

import React from 'react';
import { ColorPalette } from '@/lib/colorPalettes';
import styles from './MenuButton.module.css';

interface MenuButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  icon?: React.ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  palette?: ColorPalette;
}

export default function MenuButton({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  icon,
  onMouseEnter,
  onMouseLeave,
  palette,
}: MenuButtonProps) {
  // Default palette colors if not provided
  const primaryColor = palette?.uiColors.primary || '#61dca3';
  const secondaryColor = palette?.uiColors.secondary || '#61b3dc';
  
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Calculate lighter and darker shades for 3D border effect
  const lightenColor = (hex: string, percent: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * percent));
    const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * percent));
    const b = Math.min(255, (num & 0xff) + Math.round(255 * percent));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  const darkenColor = (hex: string, percent: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, ((num >> 16) & 0xff) - Math.round(255 * percent));
    const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * percent));
    const b = Math.max(0, (num & 0xff) - Math.round(255 * percent));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  const buttonStyle: React.CSSProperties = 
    variant === 'primary'
      ? {
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${darkenColor(primaryColor, 0.15)} 50%, ${secondaryColor} 100%)`,
          borderColor: `${lightenColor(primaryColor, 0.2)} ${darkenColor(primaryColor, 0.2)} ${darkenColor(primaryColor, 0.4)} ${darkenColor(primaryColor, 0.2)}`,
          boxShadow: `
            0 0 20px ${hexToRgba(primaryColor, 0.5)},
            0 4px 12px ${hexToRgba('#000000', 0.4)},
            inset 0 1px 0 ${hexToRgba('#ffffff', 0.3)},
            inset 0 -1px 0 ${hexToRgba('#000000', 0.2)}
          `,
        }
      : variant === 'secondary'
      ? {
          borderColor: `${hexToRgba(primaryColor, 0.4)} ${hexToRgba(primaryColor, 0.2)} ${hexToRgba('#000000', 0.5)} ${hexToRgba(primaryColor, 0.2)}`,
          boxShadow: `
            0 0 15px ${hexToRgba(primaryColor, 0.2)},
            0 4px 12px ${hexToRgba('#000000', 0.4)},
            inset 0 1px 0 ${hexToRgba('#ffffff', 0.2)},
            inset 0 -1px 0 ${hexToRgba('#000000', 0.3)}
          `,
        }
      : {};

  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={buttonStyle}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{label}</span>
    </button>
  );
}

