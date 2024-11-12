"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Barcode, Package, Search, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
import { ProtectedRoute } from "@/components/protected-route";
import { useRouter } from "next/navigation";

export default function VendedorPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-center mb-8">Portal del Vendedor</h1>
        <AuthForm role="vendedor" />
      </div>
    );
  }

  return (
    <ProtectedRoute role="vendedor">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Portal del Vendedor</h1>
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

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Buscar Producto
            </TabsTrigger>
            <TabsTrigger value="barcode" className="flex items-center gap-2">
              <Barcode className="w-4 h-4" />
              Escanear Código
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Mis Pedidos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <Card className="p-6">
              <div className="max-w-xl mx-auto space-y-6">
                <div className="flex gap-4">
                  <Input
                    type="text"
                    placeholder="Buscar por nombre o código"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button>Buscar</Button>
                </div>

                <div className="space-y-4">
                  <p className="text-center text-muted-foreground">
                    No hay resultados para mostrar
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="barcode">
            <Card className="p-6">
              <div className="max-w-xl mx-auto text-center space-y-6">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12">
                  <p className="text-muted-foreground">
                    Haga clic para activar la cámara y escanear el código de barras
                  </p>
                  <Button className="mt-4">Activar Cámara</Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-muted-foreground">No hay pedidos activos</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}