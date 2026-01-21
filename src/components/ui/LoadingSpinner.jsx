import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const LoadingSpinner = ({ size = "md", label = "Loading...", className, variant = "default" }) => {
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

  // Layout configuration based on size
  // xs/sm: Inline, no fixed height, auto width (good for buttons)
  // md/lg/xl: Flex block, min height, full width (good for page/section loading)
  const isSmall = size === 'xs' || size === 'sm';

  const layoutClass = isSmall
    ? 'inline-flex h-auto min-h-0 w-auto'
    : 'flex h-full min-h-[200px] w-full';

  // Color variants
  const colorClass = {
      default: "border-t-blue-500",
      white: "border-t-white",
      current: "border-t-current",
  };

  // Track color variants
  const trackColorClass = variant === 'current'
    ? 'border-current opacity-25'
    : 'border-slate-700 opacity-20';

  return (
    <div
      className={twMerge(
        clsx(
          "items-center justify-center",
          layoutClass,
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
            borderThickness[size] || borderThickness.md,
            trackColorClass
          )}
        ></div>
        {/* Spinning segment */}
        <div
          className={clsx(
            "absolute top-0 left-0 w-full h-full border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin",
            borderThickness[size] || borderThickness.md,
            colorClass[variant] || colorClass.default
          )}
        ></div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default LoadingSpinner;
