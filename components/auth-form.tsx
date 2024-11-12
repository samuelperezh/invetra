"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export function AuthForm({ role }: { role: 'vendedor' | 'bodeguero' | 'admin' }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login({
        username: formData.username,
        password: formData.password,
        role,
      });

      if (success) {
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido al sistema",
        });
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error de autenticación",
          description: "Credenciales inválidas. Por favor, intente nuevamente.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al iniciar sesión.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleCredentials = () => {
    switch (role) {
      case 'vendedor':
        return { email: 'vendedor@demo.com', password: 'vendedor123' };
      case 'bodeguero':
        return { email: 'bodega@demo.com', password: 'bodega123' };
      case 'admin':
        return { email: 'admin@demo.com', password: 'admin123' };
    }
  };

  const credentials = getRoleCredentials();

  return (
    <Card className="p-6 w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username">Correo electrónico</Label>
          <Input
            id="username"
            type="email"
            placeholder="correo@ejemplo.com"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
          <p className="text-xs text-muted-foreground">
            Demo: {credentials.email}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <p className="text-xs text-muted-foreground">
            Demo: {credentials.password}
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            "Iniciar Sesión"
          )}
        </Button>
      </form>
    </Card>
  );
}