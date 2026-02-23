
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import LoadingSpinner from './LoadingSpinner';

const Button = React.forwardRef(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      asChild = false,
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? 'span' : 'button';
    const isDisabled = isLoading || disabled;
    const isIcon = size === 'icon';

    // Determine spinner size based on button size
    let spinnerSize = 'xs';
    if (size === 'lg') spinnerSize = 'sm';
    if (size === 'icon') spinnerSize = 'sm';

    return (
      <Comp
        className={twMerge(
          clsx(
            'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            isDisabled && 'pointer-events-none opacity-50',
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
            },
            className
          )
        )}
        disabled={isDisabled}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          isIcon ? (
            <LoadingSpinner size={spinnerSize} variant="current" />
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

Button.displayName = 'Button';

export { Button };
