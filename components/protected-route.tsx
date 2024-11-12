"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole: string;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false); // New state

  // Wait for Zustand state to hydrate
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      console.log('User state in ProtectedRoute:', user);
      if (!user) {
        router.push("/");
      } else if (requiredRole && user.role !== requiredRole) {
        router.push("/");
      }
    }
  }, [user, requiredRole, router, isHydrated]);

  if (!isHydrated) {
    // Optionally, render a loading spinner or nothing while hydrating
    return null;
  }

  if (!user || (requiredRole && user.role !== requiredRole)) {
    // Don't render the protected content if user is not authorized
    return null;
  }

  // Render the protected content
  return <>{children}</>;
}