// app/login/page.tsx
"use client";

import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-8">Iniciar Sesión</h1>
      <AuthForm />
    </div>
  );
}