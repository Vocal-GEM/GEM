import React from 'react';
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const LoadingSpinner = ({ size = "md", variant = "default", label = "Loading...", className }) => {
  // Size controls dimensions
  const dimensions = {
    xs: "w-3 h-3",
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  // Border width controls thickness
  const borderThickness = {
    xs: "border",
    sm: "border-2",
    md: "border-[3px]",
    lg: "border-4",
    xl: "border-[5px]",
  };

  // Color variants
  const variants = {
    default: {
      track: "border-slate-200",
      segment: "border-t-blue-600",
    },
    current: {
      track: "border-current opacity-30",
      segment: "border-t-current",
    },
    white: {
      track: "border-white/30",
      segment: "border-t-white",
    },
  };

  const selectedVariant = variants[variant] || variants.default;

  return (
    <div
      className={twMerge(
        clsx(
          "inline-flex items-center justify-center",
          className,
        ),
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className={twMerge(clsx("relative rounded-full", dimensions[size] || dimensions.md))}
      >
        {/* Track circle */}
        <div
          className={clsx(
            "absolute top-0 left-0 w-full h-full rounded-full",
            borderThickness[size] || borderThickness.md,
            selectedVariant.track
          )}
        ></div>
        {/* Spinning segment */}
        <div
          className={clsx(
            "absolute top-0 left-0 w-full h-full border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin",
            borderThickness[size] || borderThickness.md,
            selectedVariant.segment
          )}
        ></div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default LoadingSpinner;
