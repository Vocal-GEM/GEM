import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const LoadingSpinner = ({
  size = 'md',
  variant = 'default',
  label = 'Loading...',
  className,
}) => {
  // Size controls dimensions
  const dimensions = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
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
    xs: "w-4 h-4",
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  // Border width controls thickness
  const borderThickness = {
    xs: "border",
    xs: 'border-2',
    sm: 'border-2',
    md: 'border-4',
    lg: 'border-4',
    xl: 'border-8',
  };

  const variants = {
    default: 'border-t-blue-500',
    white: 'border-t-white',
    current: 'border-t-current',
  };

  const isSmall = size === 'xs' || size === 'sm';
    xs: "border-2",
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
  // Variants control colors
  const variants = {
    default: {
      track: "border-slate-700 opacity-20",
      spin: "border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent"
    },
    current: {
      track: "border-current opacity-20",
      spin: "border-t-current border-r-transparent border-b-transparent border-l-transparent"
    },
    white: {
      track: "border-white opacity-20",
      spin: "border-t-white border-r-transparent border-b-transparent border-l-transparent"
    }
  };

  const selectedVariant = variants[variant] || variants.default;

  // Inline sizes (xs, sm) shouldn't impose a large minimum height
  const isInline = size === 'xs' || size === 'sm';
  const containerClass = isInline ? 'h-auto min-h-0 inline-flex' : 'h-full min-h-[200px] flex';
  // Colors for the spinning segment
  const colors = {
    default: "border-t-blue-500",
    white: "border-t-white",
    current: "border-t-current",
  };

  // Colors for the background track
  const trackColors = {
    default: "border-slate-700",
    white: "border-white/30",
    current: "border-current opacity-30",
  };

  // For 'xs'/'sm', we usually want inline or small container.
  const containerClass = (size === 'xs' || size === 'sm')
    ? 'inline-flex h-auto min-h-0'
    : 'flex h-full min-h-[200px]';

  return (
    <div
      className={twMerge(
        clsx(
          "inline-flex items-center justify-center",
          'items-center justify-center',
          // For small sizes, use inline-flex and auto width to fit inside buttons/text.
          // For larger sizes, use flex and full width/height defaults for page/container loading.
          isSmall
            ? 'inline-flex w-auto h-auto min-h-0'
            : 'flex w-full h-full min-h-[200px]',
          className
        )
          "items-center justify-center w-full",
          containerClass,
          className,
        ),
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className={twMerge(clsx("relative rounded-full", dimensions[size] || dimensions.md))}
        className={twMerge(clsx('relative', dimensions[size] || dimensions.md))}
      >
        {/* Track circle */}
        <div
          className={clsx(
            "absolute top-0 left-0 w-full h-full rounded-full",
            borderThickness[size] || borderThickness.md,
            selectedVariant.track
            'absolute top-0 left-0 w-full h-full rounded-full opacity-20',
            // Use border-current for track if variant is current, otherwise slate-700
            variant === 'current' ? 'border-current' : 'border-slate-700',
            borderThickness[size] || borderThickness.md
            "absolute top-0 left-0 w-full h-full rounded-full",
            selectedVariant.track,
            borderThickness[size] || borderThickness.md,
            trackColors[variant] || trackColors.default
          )}
        ></div>
        {/* Spinning segment */}
        <div
          className={clsx(
            "absolute top-0 left-0 w-full h-full border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin",
            borderThickness[size] || borderThickness.md,
            selectedVariant.segment
            'absolute top-0 left-0 w-full h-full border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin',
            variants[variant] || variants.default,
            borderThickness[size] || borderThickness.md
            "absolute top-0 left-0 w-full h-full rounded-full animate-spin",
            selectedVariant.spin,
            "absolute top-0 left-0 w-full h-full border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin",
            borderThickness[size] || borderThickness.md,
            colors[variant] || colors.default
          )}
        ></div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default LoadingSpinner;
