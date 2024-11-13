"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Users, LineChart, LogOut, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ProtectedRoute } from "@/components/protected-route";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Producto {
  _id: string;
  nombre: string;
  codigo_barras: string;
  imagen_url: string;
  cantidad_disponible: number;
}

interface Usuario {
  _id: string;
  email: string;
  nombre: string;
  rol: "vendedor" | "bodega" | "admin";
  activo: boolean;
  fecha_registro: string;
}

interface Pedido {
  _id: string;
  vendedor_id: Usuario;
  items: { producto_id: Producto; cantidad_solicitada: number }[];
  estado: "pendiente" | "en_progreso" | "completado" | "cancelado";
  asignado_a: Usuario | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export default function AdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newProducto, setNewProducto] = useState({
    nombre: "",
    codigo_barras: "",
    imagen_url: "",
    cantidad_disponible: 1,
  });
  const [newUsuario, setNewUsuario] = useState({
    email: "",
    nombre: "",
    rol: "vendedor",
    contraseña: "",
  });
  const [productoToDelete, setProductoToDelete] = useState<Producto | null>(null);
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);

  useEffect(() => {
    async function fetchProductos() {
      try {
        const response = await axios.get<Producto[]>("/api/productos");
        setProductos(response.data);
      } catch (error) {
        console.error("Error al obtener los productos:", error);
      }
    }
    fetchProductos();
    const interval = setInterval(fetchProductos, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const response = await axios.get<Usuario[]>("/api/usuarios");
        setUsuarios(response.data);
      } catch (error) {
        console.error("Error al obtener los usuarios:", error);
      }
    }
    fetchUsuarios();
  }, []);

  useEffect(() => {
    async function fetchPedidos() {
      try {
        const response = await axios.get<Pedido[]>("/api/pedidos");
        setPedidos(response.data);
      } catch (error) {
        console.error("Error al obtener los pedidos:", error);
      }
    }
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProducto({ ...newProducto, [name]: value });
  };

  const handleUsuarioInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUsuario({ ...newUsuario, [name]: value });
  };

  const handleCreateProducto = async () => {
    try {
      const response = await fetch("/api/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProducto),
      });

      if (!response.ok) {
        throw new Error("Error al crear el producto");
      }

      const createdProducto = await response.json();
      setProductos([...productos, createdProducto]);
      setShowProductModal(false);
      setNewProducto({
        nombre: "",
        codigo_barras: "",
        imagen_url: "",
        cantidad_disponible: 1,
      });
    } catch (error) {
      console.error("Error al crear el producto:", error);
    }
  };

  const handleCreateUsuario = async () => {
    try {
      const response = await fetch("/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUsuario),
      });

      if (!response.ok) {
        throw new Error("Error al crear el usuario");
      }

      const createdUsuario = await response.json();
      setUsuarios([...usuarios, createdUsuario]);
      setShowUserModal(false);
      setNewUsuario({
        email: "",
        nombre: "",
        rol: "vendedor",
        contraseña: "",
      });
    } catch (error) {
      console.error("Error al crear el usuario:", error);
    }
  };

  const handleDeleteProducto = async () => {
    if (!productoToDelete) return;
    try {
      const response = await fetch(`/api/productos`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ codigo_barras: productoToDelete.codigo_barras }),
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el producto");
      }

      setProductos(productos.filter((producto) => producto._id !== productoToDelete._id));
      setShowDeleteModal(false);
      setProductoToDelete(null);
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
    }
  };

  const handleDeleteUsuario = async () => {
    if (!usuarioToDelete) return;
    try {
      const response = await fetch(`/api/usuarios`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: usuarioToDelete.email }),
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el usuario");
      }

      setUsuarios(usuarios.filter((usuario) => usuario._id !== usuarioToDelete._id));
      setShowDeleteModal(false);
      setUsuarioToDelete(null);
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
    }
  };

  const handleUpdateUsuario = async (id: string, newRole: string) => {
    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rol: newRole }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el rol del usuario");
      }

      const updatedUsuario = await response.json();
      setUsuarios(usuarios.map((usuario) => (usuario._id === id ? updatedUsuario : usuario)));
    } catch (error) {
      console.error("Error al actualizar el rol del usuario:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
      en_progreso: "bg-blue-100 text-blue-800 border-blue-200",
      completado: "bg-green-100 text-green-800 border-green-200",
      cancelado: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status as keyof typeof colors] || "";
  };

  return (
    <ProtectedRoute role="admin">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">Bienvenido, {user ? user.nombre : "Invitado"}</span>
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Inventario</h2>
                <Button onClick={() => setShowProductModal(true)}>Agregar Producto</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productos.map((producto) => (
                  <Card key={producto._id} className="overflow-hidden">
                    <div className="relative h-48">
                      <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover" />
                      <button
                        className="absolute top-2 right-2 p-1 bg-white rounded-full hover:bg-red-100"
                        onClick={() => {
                          setProductoToDelete(producto);
                          setShowDeleteModal(true);
                        }}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{producto.nombre}</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p className="flex justify-between">
                          <span>Código:</span>
                          <span className="font-medium">{producto.codigo_barras}</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Stock:</span>
                          <Badge variant="secondary">{producto.cantidad_disponible}</Badge>
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Usuarios</h2>
                <Button onClick={() => setShowUserModal(true)}>Agregar Usuario</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {usuarios.map((usuario) => (
                  <Card key={usuario._id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{usuario.nombre}</h3>
                        <p className="text-sm text-muted-foreground">{usuario.email}</p>
                      </div>
                      <button
                        className="p-1 hover:bg-red-100 rounded-full"
                        onClick={() => {
                          setUsuarioToDelete(usuario);
                          setShowDeleteModal(true);
                        }}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                    <div className="mt-4">
                      <select
                        value={usuario.rol}
                        onChange={(e) => handleUpdateUsuario(usuario._id, e.target.value)}
                        className="w-full p-2 rounded-md border border-input bg-background"
                      >
                        <option value="vendedor">Vendedor</option>
                        <option value="bodega">Bodega</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Registro: {new Date(usuario.fecha_registro).toLocaleDateString()}
                    </p>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card className="p-6">
              <div className="grid grid-cols-4 gap-4">
                {(['pendiente', 'en_progreso', 'completado', 'cancelado'] as const).map((estado) => (
                  <div key={estado} className="space-y-4">
                    <div className={`p-3 rounded-lg ${getStatusColor(estado)}`}>
                      <h3 className="font-medium text-center capitalize">
                        {estado.replace('_', ' ')}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {pedidos
                        .filter((p) => p.estado === estado)
                        .map((pedido) => (
                          <Card key={pedido._id} className="p-4 space-y-3">
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
                              {pedido.asignado_a && (
                                <p className="text-sm text-muted-foreground">
                                  Asignado a: {pedido.asignado_a.nombre}
                                </p>
                              )}
                            </div>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showProductModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-6">Agregar Nuevo Producto</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nombre del Producto</label>
                <input
                  type="text"
                  name="nombre"
                  value={newProducto.nombre}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-md border border-input"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Código de Barras</label>
                <input
                  type="text"
                  name="codigo_barras"
                  value={newProducto.codigo_barras}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-md border border-input"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">URL de la Imagen</label>
                <input
                  type="text"
                  name="imagen_url"
                  value={newProducto.imagen_url}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-md border border-input"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Cantidad Disponible</label>
                <input
                  type="number"
                  name="cantidad_disponible"
                  value={newProducto.cantidad_disponible}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-md border border-input"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowProductModal(false)}>Cancelar</Button>
              <Button onClick={handleCreateProducto}>Crear Producto</Button>
            </div>
          </Card>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-6">Agregar Nuevo Usuario</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={newUsuario.nombre}
                  onChange={handleUsuarioInputChange}
                  className="w-full p-2 rounded-md border border-input"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <input
                  type="email"
                  name="email"
                  value={newUsuario.email}
                  onChange={handleUsuarioInputChange}
                  className="w-full p-2 rounded-md border border-input"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Contraseña</label>
                <input
                  type="password"
                  name="contraseña"
                  value={newUsuario.contraseña}
                  onChange={handleUsuarioInputChange}
                  className="w-full p-2 rounded-md border border-input"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Rol</label>
                <select
                  name="rol"
                  value={newUsuario.rol}
                  onChange={(e) => setNewUsuario({ ...newUsuario, rol: e.target.value })}
                  className="w-full p-2 rounded-md border border-input"
                >
                  <option value="vendedor">Vendedor</option>
                  <option value="bodega">Bodega</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowUserModal(false)}>Cancelar</Button>
              <Button onClick={handleCreateUsuario}>Crear Usuario</Button>
            </div>
          </Card>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl mb-4">Confirmar Eliminación</h2>
            <p>
              ¿Estás seguro de que deseas eliminar el{" "}
              {productoToDelete ? `producto "${productoToDelete.nombre}"` : `usuario "${usuarioToDelete?.nombre}"`}?
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
              <Button
                onClick={productoToDelete ? handleDeleteProducto : handleDeleteUsuario}
                className="bg-red-500 text-white"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}