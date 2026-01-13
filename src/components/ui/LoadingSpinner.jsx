import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const LoadingSpinner = ({ size = "md", label = "Loading...", className }) => {
  const dimensions = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const borderThickness = {
    sm: "border-2",
    md: "border-[3px]",
    lg: "border-4",
    xl: "border-8",
  };

  // Default layout behavior:
  // - 'sm' is treated as inline-flex (good for buttons/text)
  // - others default to a centered block with min-height (good for page/section loading)
  const isSmall = size === 'sm';
  const baseClasses = isSmall
    ? "inline-flex"
    : "flex w-full min-h-[200px]";

  return (
    <div
      className={twMerge(
        clsx(
          "items-center justify-center",
          baseClasses,
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
