"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Users, LineChart, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
import { ProtectedRoute } from "@/components/protected-route";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-center mb-8">Panel de Administración</h1>
        <AuthForm role="admin" />
      </div>
    );
  }

  return (
    <ProtectedRoute role="admin">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
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

        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Inventario
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Estadísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <Card className="p-6">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Aquí se mostrará la gestión de inventario
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="p-6">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Aquí se mostrará la gestión de usuarios
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card className="p-6">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Aquí se mostrarán las estadísticas
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}