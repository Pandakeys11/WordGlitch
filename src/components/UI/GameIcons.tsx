'use client';

import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export function HomeIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RestartIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 4V10H7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23 20V14H17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.49 9C19.7969 6.64902 18.4561 4.53178 16.6291 2.94496C14.8021 1.35814 12.5715 0.367541 10.23 0.100006C7.88853 -0.167529 5.53415 0.306386 3.46658 1.44948C1.39901 2.59257 -0.300552 4.35525 -1.40983 6.49996M1 4L7 4L7 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.51 15C4.20312 17.351 5.54394 19.4682 7.37087 21.055C9.19781 22.6419 11.4285 23.6325 13.77 23.9C16.1115 24.1675 18.4659 23.6936 20.5334 22.5505C22.601 21.4074 24.3006 19.6448 25.4098 17.5M23 20L17 20L17 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PauseIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
      <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
    </svg>
  );
}

export function PaletteIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 12C8 13.1046 8.89543 14 10 14C11.1046 14 12 13.1046 12 12C12 10.8954 11.1046 10 10 10C8.89543 10 8 10.8954 8 12Z"
        fill="currentColor"
      />
      <path
        d="M12 8C12 9.10457 12.8954 10 14 10C15.1046 10 16 9.10457 16 8C16 6.89543 15.1046 6 14 6C12.8954 6 12 6.89543 12 8Z"
        fill="currentColor"
      />
      <path
        d="M16 16C16 17.1046 16.8954 18 18 18C19.1046 18 20 17.1046 20 16C20 14.8954 19.1046 14 18 14C16.8954 14 16 14.8954 16 16Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function EyeIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EyeOffIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.94 17.94C16.2306 19.243 14.1491 20.4641 12 20.4641C5 20.4641 1 12.2321 1 12.2321C2.22588 9.85112 3.74684 7.77774 5.5 6.06189M9.9 4.24C10.5883 4.07888 11.2931 3.99833 12 3.99833C19 3.99833 23 12.2303 23 12.2303C22.393 13.3157 21.6691 14.2818 20.85 15.15M14.12 14.12C13.8454 14.4147 13.5141 14.6511 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1751 15.0073 10.8016 14.8565C10.4281 14.7056 10.0887 14.481 9.80385 14.1961C9.51897 13.9113 9.29439 13.5719 9.14351 13.1984C8.99262 12.8249 8.91842 12.4247 8.92551 12.0219C8.93261 11.6191 9.02084 11.2218 9.18482 10.8538C9.3488 10.4859 9.58525 10.1546 9.88 9.88M1 1L23 23"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

