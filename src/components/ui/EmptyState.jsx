import React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { Button } from "./button";

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
    return (
        <div className={twMerge(clsx("flex flex-col items-center justify-center p-8 text-center h-full min-h-[300px] animate-in fade-in zoom-in duration-500", className))}>
            <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                {Icon && <Icon className="w-10 h-10 text-slate-500" aria-hidden="true" />}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
                {description}
            </p>
            {actionLabel && onAction && (
                <button
                    type="button"
                    onClick={onAction}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 flex items-center gap-2"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
  return (
    <div
      className={twMerge(
        clsx(
          "flex flex-col items-center justify-center p-8 text-center h-full min-h-[300px] animate-in fade-in zoom-in duration-500",
          className
        )
      )}
      role="region"
      aria-label={title}
    >
      <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-6 border border-white/5 shadow-inner">
        {Icon && <Icon className="w-10 h-10 text-slate-500" aria-hidden="true" />}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-blue-500/20 border-0 rounded-xl active:scale-95 transition-all"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
