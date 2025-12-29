/**
 * Achievement Notification System
 * Provides visual feedback for achievements and milestones
 */

export interface AchievementNotification {
  id: string;
  type: 'achievement' | 'milestone' | 'combo' | 'streak' | 'bonus';
  title: string;
  message: string;
  icon?: string;
  color?: string;
  duration: number; // milliseconds
  priority: number; // Higher = shown first
}

const NOTIFICATION_DURATION = 3000; // 3 seconds default

/**
 * Create achievement notification
 */
export function createAchievementNotification(
  achievementId: string,
  name: string,
  description: string
): AchievementNotification {
  return {
    id: `achievement-${achievementId}-${Date.now()}`,
    type: 'achievement',
    title: name,
    message: description,
    icon: '🏆',
    color: '#ffd700',
    duration: NOTIFICATION_DURATION * 1.5,
    priority: 5,
  };
}

/**
 * Create combo notification
 */
export function createComboNotification(combo: number): AchievementNotification {
  const messages: Record<number, string> = {
    2: 'Combo started!',
    3: '3x Combo!',
    5: '5x Combo!',
    7: '7x Combo!',
    10: '10x Combo!',
    15: '15x Combo!',
    20: '20x Combo!',
    25: '25x Combo!',
    30: '30x Combo!',
  };
  
  return {
    id: `combo-${combo}-${Date.now()}`,
    type: 'combo',
    title: `${combo}x Combo!`,
    message: messages[combo] || `Amazing ${combo}x combo!`,
    icon: '⚡',
    color: '#00ff00',
    duration: NOTIFICATION_DURATION,
    priority: combo >= 10 ? 4 : 3,
  };
}

/**
 * Create streak notification
 */
export function createStreakNotification(streak: number): AchievementNotification {
  return {
    id: `streak-${streak}-${Date.now()}`,
    type: 'streak',
    title: `${streak} Level Streak!`,
    message: `You've completed ${streak} levels in a row!`,
    icon: '🔥',
    color: '#ff6600',
    duration: NOTIFICATION_DURATION * 1.2,
    priority: streak >= 10 ? 4 : 3,
  };
}

/**
 * Create milestone notification
 */
export function createMilestoneNotification(
  milestone: string,
  value: number
): AchievementNotification {
  return {
    id: `milestone-${milestone}-${Date.now()}`,
    type: 'milestone',
    title: milestone,
    message: `You've reached ${value}!`,
    icon: '⭐',
    color: '#ffd700',
    duration: NOTIFICATION_DURATION,
    priority: 4,
  };
}

/**
 * Create bonus notification
 */
export function createBonusNotification(
  type: 'combo' | 'streak' | 'perfect' | 'speed',
  amount: number
): AchievementNotification {
  const configs: Record<string, { title: string; message: string; icon: string; color: string }> = {
    combo: {
      title: 'Combo Bonus!',
      message: `+${amount} bonus points`,
      icon: '⚡',
      color: '#00ff00',
    },
    streak: {
      title: 'Streak Bonus!',
      message: `+${amount} bonus points`,
      icon: '🔥',
      color: '#ff6600',
    },
    perfect: {
      title: 'Perfect Level!',
      message: `+${amount} bonus points`,
      icon: '✨',
      color: '#ff00ff',
    },
    speed: {
      title: 'Speed Bonus!',
      message: `+${amount} bonus points`,
      icon: '💨',
      color: '#00ffff',
    },
  };
  
  const config = configs[type] || configs.combo;
  
  return {
    id: `bonus-${type}-${Date.now()}`,
    type: 'bonus',
    title: config.title,
    message: config.message,
    icon: config.icon,
    color: config.color,
    duration: NOTIFICATION_DURATION,
    priority: 3,
  };
}


