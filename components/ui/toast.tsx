"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "./use-toast";

export function Toast() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-0 right-0 z-50 w-full md:max-w-[420px] p-4 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={cn(
              "relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 pr-8",
              toast.variant === "destructive" && "bg-red-600 text-white dark:bg-red-900"
            )}
          >
            <button
              onClick={() => dismiss(toast.id)}
              className="absolute right-2 top-2 opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex flex-col gap-1">
              <div className="font-semibold">{toast.title}</div>
              {toast.description && (
                <div className="text-sm opacity-90">{toast.description}</div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}