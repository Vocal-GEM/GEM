import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

const LoadingSpinner = ({
  size = 'md',
  label = 'Loading...',
  className
}) => {
  const dimensions = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const borderThickness = {
    sm: 'border-2',
    md: 'border-4',
    lg: 'border-4',
    xl: 'border-8'
  };

  // For 'sm', we usually want inline behavior (like in a button).
  // For other sizes, default to a larger container but allow override.
  const defaultLayout = size === 'sm' ? 'inline-flex min-h-0' : 'flex w-full h-full min-h-[200px]';

  return (
    <div
      role="status"
      aria-live="polite"
      className={twMerge(clsx(
        "items-center justify-center",
        defaultLayout,
        className
      ))}
import React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

const LoadingSpinner = ({ size = "md", label = "Loading...", className }) => {
  // 'sm' and 'xs' are treated as "inline/compact" mode by default
  // This helps when using the spinner inside buttons or small containers
const LoadingSpinner = ({ size = "md", label = "Loading...", className, variant = "default" }) => {
  const dimensions = {
    xs: "w-4 h-4",
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const borderThickness = {
    xs: "border-2",
    sm: "border-2",
    md: "border-4",
    lg: "border-4",
    xl: "border-8",
  };

  // For 'sm', we usually want inline or small container.
  // For other sizes, default to the original min-height, but allow override via className
  const containerClass = size === 'sm' ? 'h-auto min-h-0' : 'h-full min-h-[200px]';
  const defaultMinHeight = size === "sm" ? "min-h-0" : "min-h-[200px]";
  // For 'sm' and 'xs', we usually want inline or small container.
  // For other sizes, default to the original min-height, but allow override via className
  const containerClass = (size === 'sm' || size === 'xs') ? 'inline-flex h-auto min-h-0' : 'flex h-full min-h-[200px]';

  // Determine container classes based on size
  // 'sm' and 'xs' are treated as "inline/compact" mode by default
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
  // Define color styles based on variant
  // 'default' matches original hardcoded colors (slate track, blue spinner)
  // 'current' uses currentColor for flexible styling (e.g. inside buttons)
  const isCurrent = variant === 'current';
  const trackColor = isCurrent ? "border-current opacity-20" : "border-slate-700 opacity-20";
  const spinnerColor = isCurrent ? "border-t-current" : "border-t-blue-500";

  return (
    <div
      className={twMerge(clsx(
        "items-center justify-center w-full",
        containerClass,
        className
      ))}
      role="status"
      aria-live="polite"
      role="status"
      aria-live="polite"
      className={twMerge(
        clsx(
          "flex items-center justify-center w-full",
          containerClass,
          // Default min-height for visibility, can be overridden by className
          "h-full",
          defaultMinHeight,
          className,
        ),
          containerBase,
          containerSize,
          className
        )
      )}
    >
      <div className={twMerge(clsx("relative", dimensions[size] || dimensions.md))}>
        {/* Track circle */}
        <div
          className={clsx(
            "absolute top-0 left-0 w-full h-full rounded-full border-slate-700 opacity-20",
            borderThickness[size] || borderThickness.md
            "absolute top-0 left-0 w-full h-full rounded-full",
            trackColor,
            borderThickness[size] || borderThickness.md
            borderThickness[size] || borderThickness.md,
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
          className={clsx(
            "absolute top-0 left-0 w-full h-full border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin",
            "absolute top-0 left-0 w-full h-full border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin",
            spinnerColor,
            borderThickness[size] || borderThickness.md
          )}
        ></div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default LoadingSpinner;
