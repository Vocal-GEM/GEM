import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from "clsx";

const LoadingSpinner = ({ size = "md", variant = "default", label = "Loading...", className }) => {
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
    md: "border-[3px]",
    lg: "border-4",
    xl: "border-[5px]",
  };

  // Color variants
  const variants = {
    default: {
      track: "border-slate-700 opacity-20",
      segment: "border-t-blue-500",
    },
    current: {
      track: "border-current opacity-20",
      segment: "border-t-current",
    },
    white: {
      track: "border-white opacity-20",
      segment: "border-t-white",
    },
  };

  const selectedVariant = variants[variant] || variants.default;

  // Inline sizes (xs, sm) shouldn't impose a large minimum height
  const isInline = size === 'xs' || size === 'sm';
  const containerClass = isInline ? 'inline-flex h-auto min-h-0' : 'flex w-full h-full min-h-[200px]';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={twMerge(
        "items-center justify-center",
        containerClass,
        className
      )}
    >
      <div className={twMerge(clsx("relative rounded-full", dimensions[size] || dimensions.md))}>
        {/* Track circle */}
        <div
          className={twMerge(
            clsx(
              "absolute top-0 left-0 w-full h-full rounded-full",
              selectedVariant.track,
              borderThickness[size] || borderThickness.md
            )
          )}
        ></div>
        {/* Spinning segment */}
        <div
          className={twMerge(
            clsx(
              "absolute top-0 left-0 w-full h-full border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin",
              selectedVariant.segment,
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
