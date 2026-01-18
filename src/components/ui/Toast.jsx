import { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Toast = ({ message, type = 'success', onClose, duration = 3000, className }) => {
  useEffect(() => {
    if (duration) {
import { useEffect } from "react";
import { X, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

const Toast = ({ message, type = "success", onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration && duration > 0) {
import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Toast = ({
  message,
  type = 'success',
  onClose,
  duration = 3000,
  className,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const styles = {
    success: {
      bg: 'bg-green-500/10 border-green-500/50',
      text: 'text-green-400',
      icon: CheckCircle,
      label: 'Success'
    success: { bg: 'bg-green-500/10 border-green-500/50', text: 'text-green-400', icon: CheckCircle, label: 'Success' },
    error: { bg: 'bg-red-500/10 border-red-500/50', text: 'text-red-400', icon: XCircle, label: 'Error' },
    warning: { bg: 'bg-yellow-500/10 border-yellow-500/50', text: 'text-yellow-400', icon: AlertTriangle, label: 'Warning' },
    info: { bg: 'bg-blue-500/10 border-blue-500/50', text: 'text-blue-400', icon: Info, label: 'Information' },
    success: {
      bg: "bg-green-500/10 border-green-500/50",
      text: "text-green-400",
      icon: CheckCircle,
      label: "Success",
    },
    error: {
      bg: "bg-red-500/10 border-red-500/50",
      text: "text-red-400",
      icon: XCircle,
      label: "Error",
    },
    warning: {
      bg: "bg-yellow-500/10 border-yellow-500/50",
      text: "text-yellow-400",
      icon: AlertTriangle,
      label: "Warning",
    },
    info: {
      bg: "bg-blue-500/10 border-blue-500/50",
      text: "text-blue-400",
      icon: Info,
      label: "Information",
    },
      bg: 'bg-green-500/10 border-green-500/50',
      text: 'text-green-400',
      icon: CheckCircle,
      role: 'status',
      label: 'Success',
      live: 'polite',
      live: 'polite'
    },
    error: {
      bg: 'bg-red-500/10 border-red-500/50',
      text: 'text-red-400',
      icon: XCircle,
      label: 'Error'
      role: 'alert',
      label: 'Error',
      live: 'assertive',
      live: 'assertive'
    },
    warning: {
      bg: 'bg-yellow-500/10 border-yellow-500/50',
      text: 'text-yellow-400',
      icon: AlertTriangle,
      label: 'Warning'
      role: 'alert',
      label: 'Warning',
      live: 'assertive',
      live: 'assertive'
    },
    info: {
      bg: 'bg-blue-500/10 border-blue-500/50',
      text: 'text-blue-400',
      icon: Info,
      label: 'Information'
    },
      role: 'status',
      label: 'Information',
      live: 'polite',
    },
      live: 'polite'
    },
      live: 'polite',
      label: 'Information'
    }
  };

  const style = styles[type] || styles.success;
  const Icon = style.icon;

  const isAlert = type === 'error' || type === 'warning';
  const role = isAlert ? 'alert' : 'status';
  const ariaLive = isAlert ? 'assertive' : 'polite';

  return (
    <div
      className={twMerge(clsx(
        "fixed bottom-24 left-1/2 -translate-x-1/2 z-[100]",
        "flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-md shadow-xl",
        "animate-in fade-in slide-in-from-bottom-4",
        style.bg
      ), className)}
      role={role}
      aria-live={ariaLive}
  const role = type === 'error' || type === 'warning' ? 'alert' : 'status';
  const ariaLive = role === 'alert' ? 'assertive' : 'polite';

  return (
    <div
      className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-bottom-4 ${style.bg}`}
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
    >
      <Icon className={`w-5 h-5 ${style.text}`} aria-hidden="true" />
      <span className="sr-only">{style.label}: </span>
      <span className={`font-medium ${style.text}`}>{message}</span>
      <button
        onClick={onClose}
        className={`ml-2 hover:opacity-70 ${style.text} p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-current`}
  // Determine accessibility attributes
  const isAlert = type === "error" || type === "warning";
  const role = isAlert ? "alert" : "status";
  const ariaLive = isAlert ? "assertive" : "polite";

  return (
    <div
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
  return (
    <div
      role={style.role}
      aria-live={style.live}
      aria-atomic="true"
      className={twMerge(clsx(
        "fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-bottom-4",
        style.bg,
        className
      ))}
      className={twMerge(
        clsx(
          'fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-bottom-4',
          style.bg,
        ),
          className
        )
      )}
    >
      <Icon className={`w-5 h-5 ${style.text}`} aria-hidden="true" />
      <span className="sr-only">{style.label}: </span>
      <span className={`font-medium ${style.text}`}>{message}</span>
      <button
        onClick={onClose}
        className={clsx(
          "ml-2 hover:opacity-70 p-1 rounded-full transition-opacity",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-current",
      <Icon className={clsx('w-5 h-5', style.text)} aria-hidden="true" />
      <span className="sr-only">{style.label}: </span>
      <span className={clsx('font-medium', style.text)}>{message}</span>
      <button
        onClick={onClose}
        className={clsx(
          'ml-2 hover:opacity-70 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-current',
          "ml-2 hover:opacity-70 p-1 rounded-full transition-opacity",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-current",
          style.text,
          "ml-2 hover:opacity-70 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-current",
          "ml-2 hover:opacity-70 p-1 rounded-full",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-current",
          style.text
        )}
        aria-label="Close notification"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
};

export default Toast;
