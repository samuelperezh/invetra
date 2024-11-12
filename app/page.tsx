"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { PackageSearch, Users, Warehouse } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const { setUser } = useAuth();

  useEffect(() => {
    const storedUser = Cookies.get("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUser(user);
      router.push(`/${user.rol}`);
    }
  }, [router, setUser]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Sistema de Gestión de Inventario
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Gestión eficiente de pedidos entre puntos de venta y bodega
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Vendedores</h2>
              <p className="text-muted-foreground">
                Personal de ventas
              </p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Warehouse className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Bodega</h2>
              <p className="text-muted-foreground">
                Personal de bodega
              </p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <PackageSearch className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Administración</h2>
              <p className="text-muted-foreground">
                Gestión de inventario y usuarios
              </p>
            </div>
          </Card>
        </div>

        <div className="flex justify-center p-10">
          <Link href="/login">
            <Button className="px-8 py-4 text-xl">Iniciar Sesión</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}