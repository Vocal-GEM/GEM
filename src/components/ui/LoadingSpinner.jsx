import React from 'react';
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const LoadingSpinner = ({ size = "md", label = "Loading...", variant = "default", className }) => {
  // Size controls dimensions
  const dimensions = {
    xs: "w-4 h-4",
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  // Border width controls thickness
  const borderThickness = {
    xs: "border-2",
    sm: "border-2",
    md: "border-4",
    lg: "border-4",
    xl: "border-8",
  };

  // Colors based on variant
  const colors = {
      default: { track: "border-slate-700", spin: "border-t-blue-500" },
      current: { track: "border-current opacity-20", spin: "border-t-current" },
      white:   { track: "border-white opacity-20", spin: "border-t-white" },
  };

  const colorStyle = colors[variant] || colors.default;

  // For small sizes or when variant is current (inline usage), we want minimal container
  const isInline = size === 'xs' || size === 'sm' || variant === 'current';
  const containerClass = isInline
    ? 'inline-flex h-auto w-auto min-h-0'
    : 'flex w-full h-full min-h-[200px]';

  return (
    <div
      className={twMerge(
        clsx(
          "items-center justify-center",
          containerClass,
          className,
        ),
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className={twMerge(clsx("relative", dimensions[size] || dimensions.md))}
      >
        {/* Track circle */}
        <div
          className={clsx(
            "absolute top-0 left-0 w-full h-full rounded-full",
            colorStyle.track,
            borderThickness[size] || borderThickness.md,
          )}
        ></div>
        {/* Spinning segment */}
        <div
          className={clsx(
            "absolute top-0 left-0 w-full h-full border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin",
            colorStyle.spin,
            borderThickness[size] || borderThickness.md,
          )}
        ></div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default LoadingSpinner;
