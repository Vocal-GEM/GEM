import React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import LoadingSpinner from "./LoadingSpinner";

const Button = React.forwardRef(({ className, variant, size, asChild = false, isLoading = false, children, ...props }, ref) => {
  const Comp = asChild ? "span" : "button"; // Simple placeholder for Slot
  return (
    <Comp
      className={twMerge(clsx(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-slate-900 text-slate-50 hover:bg-slate-900/90": variant === "default" || !variant,
          "bg-red-500 text-slate-50 hover:bg-red-500/90": variant === "destructive",
          "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900": variant === "outline",
          "bg-slate-100 text-slate-900 hover:bg-slate-100/80": variant === "secondary",
          "hover:bg-slate-100 hover:text-slate-900": variant === "ghost",
          "text-slate-900 underline-offset-4 hover:underline": variant === "link",
          "h-10 px-4 py-2": size === "default" || !size,
          "h-9 rounded-md px-3": size === "sm",
          "h-11 rounded-md px-8": size === "lg",
          "h-10 w-10": size === "icon",
        },
        className
      ))}
      ref={ref}
      disabled={isLoading || props.disabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        size === "icon" ? (
          <LoadingSpinner size="sm" className="text-current" />
        ) : (
          <>
            <LoadingSpinner size="sm" className="mr-2 text-current" />
            {children}
          </>
        )
      ) : (
        children
      )}
    </Comp>
  );
});
Button.displayName = "Button";

export { Button };
