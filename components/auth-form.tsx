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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState<{
    username: string;
    password: string;
    role: "vendedor" | "bodega" | "admin";
  }>({
    username: "",
    password: "",
    role: "vendedor",
  });
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const success = await login(formData);

      if (success) {
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido al sistema",
        });
        router.push(`/${formData.role}`);
      } else {
        setErrorMessage("Credenciales inválidas. Por favor, intente nuevamente.");
        setTimeout(() => setErrorMessage(""), 5000);
        toast({
          variant: "destructive",
          title: "Error de autenticación",
          description: "Credenciales inválidas. Por favor, intente nuevamente.",
        });
      }
    } catch (error) {
      setErrorMessage("Ocurrió un error al iniciar sesión.");
      setTimeout(() => setErrorMessage(""), 5000);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al iniciar sesión.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 w-full max-w-md mx-auto">
      {errorMessage && (
        <Card className="mb-4 p-4 bg-destructive/10 text-destructive">
          {errorMessage}
        </Card>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username">Correo electrónico</Label>
          <Input
            id="username"
            type="email"
            placeholder="correo@ejemplo.com"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Rol</Label>
          <Select
            onValueChange={(value: "vendedor" | "bodega" | "admin") => setFormData({ ...formData, role: value })}
            defaultValue={formData.role}
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vendedor">Vendedor</SelectItem>
              <SelectItem value="bodega">Bodega</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
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