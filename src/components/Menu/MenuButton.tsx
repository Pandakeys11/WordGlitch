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

  const buttonStyle: React.CSSProperties = 
    variant === 'primary'
      ? {
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          boxShadow: `0 4px 20px ${hexToRgba(primaryColor, 0.4)}`,
        }
      : variant === 'secondary'
      ? {
          borderColor: hexToRgba(primaryColor, 0.5),
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

