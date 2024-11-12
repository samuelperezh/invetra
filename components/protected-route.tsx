"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role: string;
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.rol !== role) {
      router.push("/");
    }
  }, [user, role, router]);

  if (!user || user.rol !== role) {
    return null;
  }

  return <>{children}</>;
}