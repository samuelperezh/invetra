"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Package, LogOut, Minus, Plus, Trash2, CheckCircle } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/lib/auth";
import { ProtectedRoute } from "@/components/protected-route";
import { useRouter } from "next/navigation";

interface Producto {
  _id: string;
  nombre: string;
  codigo_barras: string;
  imagen_url: string;
  cantidad_disponible: number;
}

interface CartItem {
  producto: Producto;
  cantidad: number;
}

interface Usuario {
  _id: string;
  rol: string;
  nombre: string;
  email: string;
}

interface Pedido {
  _id: string;
  vendedor_id: Usuario;  // Changed from string to Usuario
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
  items: {
    _id: string;  // Added _id for the item
    producto_id: Producto;
    cantidad_solicitada: number;
  }[];
  asignado_a: Usuario;  // Added asignado_a
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export default function VendedorPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    // Initial fetch
    fetchProductos();
    fetchPedidos();

    // Set up intervals for auto-refresh
    const productosInterval = setInterval(fetchProductos, 5000);
    const pedidosInterval = setInterval(fetchPedidos, 5000);

    // Cleanup on component unmount
    return () => {
      clearInterval(productosInterval);
      clearInterval(pedidosInterval);
    };
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await axios.get<Producto[]>("/api/productos");
      setProductos(response.data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  const fetchPedidos = async () => {
    try {
      const response = await axios.get<Pedido[]>("/api/pedidos");
      console.log("Received pedidos:", response.data);
      const userPedidos = response.data.filter(p => p.vendedor_id._id === user?._id);
      setPedidos(userPedidos);
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
    }
  };

  const filteredProducts = searchTerm
    ? productos.filter(
        (p) =>
          p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.codigo_barras.includes(searchTerm)
      )
    : productos;

  const addToCart = (producto: Producto, cantidad: number) => {
    setCartItems((current) => {
      const existing = current.find((item) => item.producto._id === producto._id);
      if (existing) {
        return current.map((item) =>
          item.producto._id === producto._id
            ? { ...item, cantidad: Math.min(item.cantidad + cantidad, producto.cantidad_disponible) }
            : item
        );
      }
      return [...current, { producto, cantidad }];
    });
  };

  const updateCartItemQuantity = (productoId: string, cantidad: number) => {
    setCartItems((current) =>
      current.map((item) =>
        item.producto._id === productoId
          ? { ...item, cantidad: Math.min(cantidad, item.producto.cantidad_disponible) }
          : item
      )
    );
  };

  const removeFromCart = (productoId: string) => {
    setCartItems((current) => current.filter((item) => item.producto._id !== productoId));
  };

  const findLeastBusyBodega = async () => {
    try {
      // Get all bodega users and their pending/in-progress orders count
      const usuariosResponse = await axios.get<Usuario[]>('/api/usuarios');
      const bodegaUsers = usuariosResponse.data.filter(u => u.rol === 'bodega');
      
      const pedidosResponse = await axios.get('/api/pedidos');
      const activePedidos = pedidosResponse.data.filter(
        (p: any) => p.estado === 'pendiente' || p.estado === 'en_progreso'
      );

      // Count active orders per bodega user
      const orderCounts = bodegaUsers.map(user => ({
        userId: user._id,
        count: activePedidos.filter((p: any) => p.asignado_a === user._id).length
      }));

      // Find user with least orders
      const leastBusy = orderCounts.sort((a, b) => a.count - b.count)[0];
      return leastBusy?.userId;
    } catch (error) {
      console.error('Error finding least busy bodega:', error);
      return null;
    }
  };

  const handleCreatePedido = async () => {
    if (!user || cartItems.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const bodegaUserId = await findLeastBusyBodega();
      
      const pedidoData = {
        vendedor_id: user._id,
        items: cartItems.map(item => ({
          producto_id: item.producto._id,
          cantidad_solicitada: item.cantidad
        })),
        asignado_a: bodegaUserId
      };

      await axios.post('/api/pedidos', pedidoData);
      setCartItems([]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000); // Hide after 3 seconds
    } catch (error) {
      console.error('Error creating pedido:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelPedido = async (pedidoId: string) => {
    try {
      const response = await axios.delete(`/api/pedidos/${pedidoId}`);
      if (response.status === 200) {
        // Refresh the pedidos list immediately after successful cancellation
        await fetchPedidos();
        // Show success message (optional)
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error al cancelar pedido:", error);
    }
  };

  const renderPedidoCard = (pedido: Pedido) => {
    return (
      <Card key={pedido._id} className="mb-4 p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-medium">Pedido #{pedido._id.slice(-6)}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(pedido.fecha_creacion).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              Asignado a: {pedido.asignado_a.nombre}
            </p>
          </div>
          {pedido.estado === 'pendiente' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleCancelPedido(pedido._id)}
            >
              Cancelar
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {pedido.items.map((item) => (
            <div key={item._id} className="text-sm flex justify-between">
              <span>{item.producto_id.nombre}</span>
              <span>Cantidad: {item.cantidad_solicitada}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  return (
    <ProtectedRoute role="vendedor">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Portal del Vendedor</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Bienvenido, {user ? user.nombre : "Invitado"}
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

        {showSuccess && (
          <Card className="p-4 mb-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <p>Pedido enviado exitosamente</p>
            </div>
          </Card>
        )}

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Buscar Producto
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Mis Pedidos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <Card className="p-6">
              <div className="space-y-6">
                {cartItems.length > 0 && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold">Pedido Actual</h3>
                      <Button 
                        onClick={handleCreatePedido}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Enviando...' : 'Enviar Pedido'}
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.producto._id} className="flex items-center justify-between p-4 border rounded">
                          <div className="flex items-center gap-4">
                            <img src={item.producto.imagen_url} alt={item.producto.nombre} className="w-16 h-16 object-cover" />
                            <div>
                              <h4 className="font-medium">{item.producto.nombre}</h4>
                              <p className="text-sm text-muted-foreground">{item.producto.codigo_barras}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => updateCartItemQuantity(item.producto._id, Math.max(1, item.cantidad - 1))}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span>{item.cantidad}</span>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => updateCartItemQuantity(item.producto._id, item.cantidad + 1)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => removeFromCart(item.producto._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Input
                    type="text"
                    placeholder="Buscar por nombre o código"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((producto) => (
                    <Card key={producto._id} className="p-4">
                      <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-48 object-cover mb-4" />
                      <h3 className="font-bold">{producto.nombre}</h3>
                      <p className="text-sm text-muted-foreground">{producto.codigo_barras}</p>
                      <p className="text-sm">Disponible: {producto.cantidad_disponible}</p>
                      <div className="flex items-center gap-2 mt-4">
                        <Input
                          type="number"
                          min="1"
                          max={producto.cantidad_disponible}
                          defaultValue="1"
                          className="w-24"
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value > 0 && value <= producto.cantidad_disponible) {
                              e.target.dataset.currentValue = value.toString();
                            }
                          }}
                        />
                        <Button
                          onClick={() => {
                            const input = document.querySelector(`input[max="${producto.cantidad_disponible}"]`) as HTMLInputElement;
                            const cantidad = parseInt(input.value);
                            if (cantidad > 0 && cantidad <= producto.cantidad_disponible) {
                              addToCart(producto, cantidad);
                              input.value = "1";
                            }
                          }}
                        >
                          Agregar
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="p-6">
              <div className="grid grid-cols-4 gap-4">
                {(['pendiente', 'en_progreso', 'completado', 'cancelado'] as const).map((estado) => (
                  <div key={estado} className="space-y-4">
                    <div className="bg-secondary p-2 rounded-lg">
                      <h3 className="font-medium text-center capitalize">
                        {estado.replace('_', ' ')}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {pedidos
                        .filter((p) => p.estado === estado)
                        .map((pedido) => renderPedidoCard(pedido))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}