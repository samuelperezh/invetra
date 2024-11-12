"use client";

import { useState, useEffect, useCallback } from "react";

export type ToastVariant = "default" | "destructive";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastState {
  toasts: Toast[];
}

const TOAST_TIMEOUT = 5000;

export function useToast() {
  const [state, setState] = useState<ToastState>({ toasts: [] });

  const removeToast = useCallback((id: string) => {
    setState((state) => ({
      ...state,
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  }, []);

  useEffect(() => {
    const timeouts = state.toasts.map((toast) => {
      return setTimeout(() => {
        removeToast(toast.id);
      }, TOAST_TIMEOUT);
    });

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [state.toasts, removeToast]);

  const toast = useCallback(
    ({ title, description, variant = "default" }: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2);
      setState((state) => ({
        ...state,
        toasts: [...state.toasts, { id, title, description, variant }],
      }));
    },
    []
  );

  return {
    toast,
    toasts: state.toasts,
    dismiss: removeToast,
  };
}