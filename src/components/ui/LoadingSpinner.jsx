import React from 'react';
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const LoadingSpinner = ({
  size = "md",
  label = "Loading...",
  className
}) => {
  const dimensions = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const borderThickness = {
    sm: "border-2",
    md: "border-4",
    lg: "border-4",
    xl: "border-8",
  };

  // Determine container classes based on size
  // 'sm' is treated as "inline/compact" mode by default
  const isSmall = size === 'sm';

  const containerBase = "flex items-center justify-center";
  const containerSize = isSmall ? "w-auto h-auto min-h-0 inline-flex" : "w-full h-full min-h-[200px]";

  return (
    <div
      role="status"
      aria-live="polite"
      className={twMerge(
        clsx(
          containerBase,
          containerSize,
          className
        )
      )}
    >
      <div
        className={twMerge(clsx("relative", dimensions[size] || dimensions.md))}
      >
        {/* Track circle */}
        <div
          className={clsx(
            "absolute top-0 left-0 w-full h-full rounded-full border-current opacity-20",
            borderThickness[size] || borderThickness.md,
          )}
        ></div>
        {/* Spinning segment */}
        <div
          className={clsx(
            "absolute top-0 left-0 w-full h-full border-t-current border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin",
            borderThickness[size] || borderThickness.md,
          )}
        ></div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default LoadingSpinner;
