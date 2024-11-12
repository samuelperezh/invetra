"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState<{
    email: string;
    contraseña: string;
    rol: "vendedor" | "bodega" | "admin";
  }>({
    email: "",
    contraseña: "",
    rol: "vendedor",
  });
  const router = useRouter();
  const { toast } = useToast();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          contraseña: formData.contraseña,
        }),
      });

      if (response.ok) {
        const user = await response.json();

        if (user.rol !== formData.rol) {
          setErrorMessage("Rol seleccionado incorrecto.");
          setTimeout(() => setErrorMessage(""), 5000);
          toast({
            variant: "destructive",
            title: "Error de rol",
            description: "El rol seleccionado no coincide con el usuario.",
          });
        } else {
          setUser(user);

          toast({
            title: "Inicio de sesión exitoso",
            description: "Bienvenido al sistema",
          });
          router.push(`/${formData.rol}`);
        }
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Credenciales inválidas.");
        setTimeout(() => setErrorMessage(""), 5000);
        toast({
          variant: "destructive",
          title: "Error de autenticación",
          description: errorData.message || "Credenciales inválidas.",
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
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="correo@ejemplo.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contraseña">Contraseña</Label>
          <Input
            id="contraseña"
            type="password"
            value={formData.contraseña}
            onChange={(e) =>
              setFormData({ ...formData, contraseña: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rol">Rol</Label>
          <Select
            onValueChange={(value: "vendedor" | "bodega" | "admin") =>
              setFormData({ ...formData, rol: value })
            }
            defaultValue={formData.rol}
          >
            <SelectTrigger id="rol">
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