import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const LoadingSpinner = ({
  label = 'Loading...',
  size = 'md',
  className,
  ...props
}) => {
  const dimensions = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const borderThickness = {
    sm: 'border-2',
    md: 'border-4',
    lg: 'border-4',
    xl: 'border-8',
  };

  // Determine defaults based on size
  const isSmall = size === 'sm';
  const defaultLayout = isSmall ? "inline-flex" : "flex w-full min-h-[200px]";

  // Default to blue-500 if no color is provided in className.
  // We use text-blue-500 so that border-current picks it up.
  // This allows overrides like "text-white" to work seamlessly.
  const defaultColor = "text-blue-500";

  return (
    <div
      role="status"
      aria-live="polite"
      className={twMerge(
        clsx(
          "items-center justify-center",
          defaultLayout,
          defaultColor,
          className
        )
      )}
      {...props}
    >
      <div className={twMerge(clsx("relative", dimensions[size] || dimensions.md))}>
        {/* Track circle - matches text color with low opacity for subtle background */}
        <div
          className={clsx(
            "absolute top-0 left-0 w-full h-full rounded-full border-current opacity-20",
            borderThickness[size] || borderThickness.md
          )}
        ></div>
        {/* Spinning segment - matches text color */}
        <div
          className={clsx(
            "absolute top-0 left-0 w-full h-full border-t-current border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin",
            borderThickness[size] || borderThickness.md
          )}
        ></div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default LoadingSpinner;
