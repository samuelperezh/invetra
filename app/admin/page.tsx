"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
              <div className="text-center mb-4">
                <Button onClick={() => setShowProductModal(true)}>Agregar Producto</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productos.map((producto) => (
                  <Card key={producto._id} className="p-4 relative">
                    <button
                      className="absolute top-2 right-2 text-red-500"
                      onClick={() => {
                        setProductoToDelete(producto);
                        setShowDeleteModal(true);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-48 object-cover mb-4" />
                    <h2 className="text-xl font-bold">{producto.nombre}</h2>
                    <p>Código de Barras: {producto.codigo_barras}</p>
                    <p>Cantidad Disponible: {producto.cantidad_disponible}</p>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="p-6">
              <div className="text-center mb-4">
                <Button onClick={() => setShowUserModal(true)}>Agregar Usuario</Button>
              </div>
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2">Nombre</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Rol</th>
                    <th className="py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario._id}>
                      <td className="py-2">{usuario.nombre}</td>
                      <td className="py-2">{usuario.email}</td>
                      <td className="py-2">
                        <select
                          value={usuario.rol}
                          onChange={(e) => handleUpdateUsuario(usuario._id, e.target.value)}
                        >
                          <option value="vendedor">Vendedor</option>
                          <option value="bodega">Bodega</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-2">
                        <button
                          className="text-red-500"
                          onClick={() => {
                            setUsuarioToDelete(usuario);
                            setShowDeleteModal(true);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card className="p-6">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold">Tablero Kanban de Pedidos</h2>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {["pendiente", "en_progreso", "completado", "cancelado"].map((estado) => (
                  <div key={estado} className="bg-gray-100 p-4 rounded-lg shadow">
                    <h3 className="text-xl font-bold mb-2 capitalize">{estado === "en_progreso" ? "En progreso" : estado}</h3>
                    {pedidos
                      .filter((pedido) => pedido.estado === estado)
                      .map((pedido) => (
                        <div key={pedido._id} className="bg-white p-2 mb-2 rounded shadow">
                          <p><strong>Vendedor:</strong> {pedido.vendedor_id.nombre}</p>
                          <p><strong>Asignado a:</strong> {pedido.asignado_a ? pedido.asignado_a.nombre : "No asignado"}</p>
                          <p><strong>Fecha de Creación:</strong> {new Date(pedido.fecha_creacion).toLocaleDateString()}</p>
                          <p><strong>Items:</strong></p>
                          <ul>
                            {pedido.items.map((item) => (
                              <li key={item.producto_id._id}>
                                {item.producto_id.nombre} - Cantidad: {item.cantidad_solicitada}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showProductModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl mb-4">Agregar Nuevo Producto</h2>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={newProducto.nombre}
              onChange={handleInputChange}
              className="mb-2 p-2 border border-gray-300 rounded w-full"
            />
            <input
              type="text"
              name="codigo_barras"
              placeholder="Código de Barras"
              value={newProducto.codigo_barras}
              onChange={handleInputChange}
              className="mb-2 p-2 border border-gray-300 rounded w-full"
            />
            <input
              type="text"
              name="imagen_url"
              placeholder="URL de la Imagen"
              value={newProducto.imagen_url}
              onChange={handleInputChange}
              className="mb-2 p-2 border border-gray-300 rounded w-full"
            />
            <input
              type="number"
              name="cantidad_disponible"
              placeholder="Cantidad Disponible"
              value={newProducto.cantidad_disponible}
              onChange={handleInputChange}
              className="mb-2 p-2 border border-gray-300 rounded w-full"
            />
            <div className="flex justify-end gap-2">
              <Button onClick={() => setShowProductModal(false)}>Cancelar</Button>
              <Button onClick={handleCreateProducto}>Crear</Button>
            </div>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl mb-4">Agregar Nuevo Usuario</h2>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={newUsuario.nombre}
              onChange={handleUsuarioInputChange}
              className="mb-2 p-2 border border-gray-300 rounded w-full"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={newUsuario.email}
              onChange={handleUsuarioInputChange}
              className="mb-2 p-2 border border-gray-300 rounded w-full"
            />
            <input
              type="password"
              name="contraseña"
              placeholder="Contraseña"
              value={newUsuario.contraseña}
              onChange={handleUsuarioInputChange}
              className="mb-2 p-2 border border-gray-300 rounded w-full"
            />
            <select
              name="rol"
              value={newUsuario.rol}
              onChange={(e) => setNewUsuario({ ...newUsuario, rol: e.target.value })}
              className="mb-2 p-2 border border-gray-300 rounded w-full"
            >
              <option value="vendedor">Vendedor</option>
              <option value="bodega">Bodega</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setShowUserModal(false)}>Cancelar</Button>
              <Button onClick={handleCreateUsuario}>Crear</Button>
            </div>
          </div>
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