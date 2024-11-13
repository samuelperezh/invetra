"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push(`/${user.rol}`);
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-8">Iniciar Sesión</h1>
      <AuthForm />
    </div>
  );
}