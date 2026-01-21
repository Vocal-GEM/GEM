import clsx from "clsx";
import { twMerge } from "tailwind-merge";

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
    md: "border-4",
    lg: "border-4",
    xl: "border-8",
  };

  // Variant controls colors
  const variantStyles = {
    default: {
      track: "border-slate-700 opacity-20",
      spin: "border-t-blue-500",
    },
    white: {
      track: "border-white opacity-20",
      spin: "border-t-white",
    },
    current: {
      track: "border-current opacity-20",
      spin: "border-t-current",
    },
  };

  const selectedVariant = variantStyles[variant] || variantStyles.default;

  // For 'sm' and 'xs', we usually want inline or small container.
  const isSmall = size === 'sm' || size === 'xs';
  const containerClass = isSmall ? 'h-auto min-h-0' : 'h-full min-h-[200px]';

  return (
    <div
      className={twMerge(
        clsx(
          "flex items-center justify-center w-full",
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
            selectedVariant.track,
            borderThickness[size] || borderThickness.md,
          )}
        ></div>
        {/* Spinning segment */}
        <div
          className={clsx(
            "absolute top-0 left-0 w-full h-full border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin",
            selectedVariant.spin,
            borderThickness[size] || borderThickness.md,
          )}
        ></div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default LoadingSpinner;
