import React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import LoadingSpinner from "./LoadingSpinner";

const Button = React.forwardRef(({ className, variant, size, asChild = false, isLoading, children, ...props }, ref) => {
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
      disabled={props.disabled || isLoading}
      ref={ref}
      {...props}
    >
      {isLoading ? (
        size === 'icon' ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            {children}
          </>
        )
      ) : (
        children
      )}
    </Comp>
  );
});
import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import LoadingSpinner from './LoadingSpinner';

const Button = React.forwardRef(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      variant = "default",
      size = "default",
      asChild = false,
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? "span" : "button";
    const isDisabled = isLoading || disabled;
    const isIcon = size === 'icon';

    // Determine spinner size based on button size
    let spinnerSize = "xs"; // Default for small/medium buttons
    if (size === "lg") spinnerSize = "sm";
    if (size === "icon") spinnerSize = "sm";

    return (
      <Comp
        className={twMerge(
          clsx(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            // Apply disabled styles via class to support non-button elements or explicit loading state
            isDisabled && "pointer-events-none opacity-50",
            {
              'bg-slate-900 text-slate-50 hover:bg-slate-900/90':
                variant === 'default',
              'bg-red-500 text-slate-50 hover:bg-red-500/90':
                variant === 'destructive',
              'border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900':
                variant === 'outline',
              'bg-slate-100 text-slate-900 hover:bg-slate-100/80':
                variant === 'secondary',
              'hover:bg-slate-100 hover:text-slate-900': variant === 'ghost',
              'text-slate-900 underline-offset-4 hover:underline':
                variant === 'link',
              'h-10 px-4 py-2': size === 'default',
              'h-9 rounded-md px-3': size === 'sm',
              'h-11 rounded-md px-8': size === 'lg',
              'h-10 w-10': size === 'icon',
              "bg-slate-900 text-slate-50 hover:bg-slate-900/90":
                variant === "default",
              "bg-red-500 text-slate-50 hover:bg-red-500/90":
                variant === "destructive",
              "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900":
                variant === "outline",
              "bg-slate-100 text-slate-900 hover:bg-slate-100/80":
                variant === "secondary",
              "hover:bg-slate-100 hover:text-slate-900": variant === "ghost",
              "text-slate-900 underline-offset-4 hover:underline":
                variant === "link",
              "h-10 px-4 py-2": size === "default",
              "h-9 rounded-md px-3": size === "sm",
              "h-11 rounded-md px-8": size === "lg",
              "h-10 w-10": size === "icon",
            },
            className
          )
        )}
        disabled={isDisabled}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          size === 'icon' ? (
            <LoadingSpinner size="sm" variant="current" label="Loading" />
          ) : (
            <>
              <LoadingSpinner size="xs" variant="current" className="mr-2" label="Loading" />
          size === "icon" ? (
            <LoadingSpinner size={spinnerSize} variant="current" />
          isIcon ? (
            <LoadingSpinner size="sm" variant="current" />
          ) : (
            <>
              <LoadingSpinner size={spinnerSize} variant="current" className="mr-2" />
              {children}
            </>
          )
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button };
