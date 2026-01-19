import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

const LoadingSpinner = ({
  size = 'md',
  label = 'Loading...',
  className,
  variant = 'default',
}) => {
  const dimensions = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const borderThickness = {
    xs: 'border-2',
    sm: 'border-2',
    md: 'border-4',
    lg: 'border-4',
    xl: 'border-8',
  };

  const isSmall = size === 'sm' || size === 'xs';

  const containerBase = 'flex items-center justify-center';
  const containerSize = isSmall
    ? 'inline-flex w-auto h-auto min-h-0'
    : 'w-full h-full min-h-[200px]';

  const isCurrent = variant === 'current';
  const trackColor = isCurrent
    ? 'border-current opacity-20'
    : 'border-slate-700 opacity-20';
  const spinnerColor = isCurrent ? 'border-t-current' : 'border-t-blue-500';

  return (
    <div
      role="status"
      aria-live="polite"
      className={twMerge(clsx(containerBase, containerSize, className))}
    >
      <div
        className={twMerge(clsx('relative', dimensions[size] || dimensions.md))}
      >
        {/* Track circle */}
        <div
          className={twMerge(
            clsx(
              'absolute top-0 left-0 w-full h-full rounded-full',
              trackColor,
              borderThickness[size] || borderThickness.md
            )
          )}
        ></div>
        {/* Spinning segment */}
        <div
          className={twMerge(
            clsx(
              'absolute top-0 left-0 w-full h-full border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin',
              spinnerColor,
              borderThickness[size] || borderThickness.md
            )
          )}
        ></div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default LoadingSpinner;
