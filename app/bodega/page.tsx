"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ProtectedRoute } from "@/components/protected-route";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Producto {
  _id: string;
  nombre: string;
  cantidad_disponible: number;
}

interface Pedido {
  _id: string;
  vendedor_id: {
    _id: string;
    nombre: string;
  };
  estado: 'pendiente' | 'en_progreso' | 'completado';
  items: {
    producto_id: Producto;
    cantidad_solicitada: number;
  }[];
  fecha_creacion: string;
  asignado_a: {
    _id: string;
    nombre: string;
  };
}

const allowedTransitions: { [key: string]: string[] } = {
  pendiente: ['en_progreso'],
  en_progreso: ['completado'],
  completado: [],
};

export default function BodegaPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 5000);
    return () => clearInterval(interval);
  }, [user?._id]);

  const fetchPedidos = async () => {
    try {
      const response = await axios.get<Pedido[]>("/api/pedidos");
      // Filter pedidos assigned to current bodega user
      const userPedidos = response.data.filter(
        (p) => p.asignado_a?._id === user?._id && p.estado !== 'cancelado'
      );
      setPedidos(userPedidos);
    } catch (error) {
      console.error("Error fetching pedidos:", error);
    }
  };

  const updatePedidoStatus = async (pedidoId: string, newStatus: string) => {
    try {
      await axios.put(`/api/pedidos/${pedidoId}`, {
        estado: newStatus,
      });
      await fetchPedidos();
    } catch (error) {
      console.error("Error updating pedido status:", error);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceStatus = result.source.droppableId;
    const destinationStatus = result.destination.droppableId;
    const pedidoId = result.draggableId;

    // Check if the transition is allowed
    if (!allowedTransitions[sourceStatus]?.includes(destinationStatus)) {
      return;
    }

    updatePedidoStatus(pedidoId, destinationStatus);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
      en_progreso: "bg-blue-100 text-blue-800 border-blue-200",
      completado: "bg-green-100 text-green-800 border-green-200",
    };
    return colors[status as keyof typeof colors] || "";
  };

  return (
    <ProtectedRoute role="bodega">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Panel de Bodega</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Bienvenido, {user?.nombre}
            </span>
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

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-3 gap-4">
            {(['pendiente', 'en_progreso', 'completado'] as const).map((estado) => (
              <div key={estado} className="space-y-4">
                <div className={`p-3 rounded-lg ${getStatusColor(estado)}`}>
                  <h3 className="font-medium text-center capitalize">
                    {estado.replace('_', ' ')}
                  </h3>
                </div>
                <Droppable droppableId={estado}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-4"
                    >
                      {pedidos
                        .filter((p) => p.estado === estado)
                        .map((pedido, index) => (
                          <Draggable
                            key={pedido._id}
                            draggableId={pedido._id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <Card className="p-4 space-y-3">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="text-sm text-muted-foreground">
                                        Pedido #{pedido._id.slice(-6)}
                                      </p>
                                      <p className="font-medium">
                                        Vendedor: {pedido.vendedor_id.nombre}
                                      </p>
                                    </div>
                                    <Badge variant="secondary">
                                      {pedido.estado.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                  <div className="space-y-2">
                                    {pedido.items.map((item) => (
                                      <div
                                        key={item.producto_id._id}
                                        className="flex justify-between items-center text-sm"
                                      >
                                        <span>{item.producto_id.nombre}</span>
                                        <span className="font-medium">
                                          x{item.cantidad_solicitada}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="pt-2 border-t">
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(pedido.fecha_creacion).toLocaleString()}
                                    </p>
                                  </div>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </ProtectedRoute>
  );
}