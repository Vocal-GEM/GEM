import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const LoadingSpinner = ({ size = "md", label = "Loading...", className }) => {
  // Size controls dimensions
  const dimensions = {
    sm: "w-4 h-4",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  // Border width controls thickness
  const borderThickness = {
    sm: "border-2",
    md: "border-4",
    lg: "border-4",
    xl: "border-8",
  };

  // For 'sm', we usually want inline or small container.
  // For other sizes, default to the original min-height, but allow override via className
  // Note: We remove w-full for sm size to avoid stretching in flex containers (like buttons)
  const containerClass = size === "sm" ? "h-auto min-h-0 inline-flex" : "h-full min-h-[200px] flex w-full";

  return (
    <div
      className={twMerge(
        clsx(
          "items-center justify-center",
          containerClass,
          className
        )
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className={clsx("relative", dimensions[size] || dimensions.md)}
      >
        {/* Track circle */}
        <div
          className={clsx(
            "absolute top-0 left-0 w-full h-full rounded-full border-current opacity-20",
            borderThickness[size] || borderThickness.md
          )}
        ></div>
        {/* Spinning segment */}
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
