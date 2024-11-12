"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
import { ProtectedRoute } from "@/components/protected-route";
import { useRouter } from "next/navigation";

export default function BodegaPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-center mb-8">Panel de Bodega</h1>
        <AuthForm role="bodega" />
      </div>
    );
  }

  return (
    <ProtectedRoute role="bodega">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Panel de Bodega</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">Bienvenido, {user.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                router.push("/");
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        <div className="flex justify-end mb-8">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los pedidos</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="in-progress">En Progreso</SelectItem>
              <SelectItem value="completed">Completados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example Order Card */}
          <Card className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Pedido #12345</p>
                <h3 className="text-lg font-semibold">Vendedor: Juan Pérez</h3>
              </div>
              <Badge variant="secondary">Pendiente</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Camiseta Básica</span>
                <span className="font-medium">x3</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Pantalón Cargo</span>
                <span className="font-medium">x2</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Solicitado hace 5 minutos
              </p>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}