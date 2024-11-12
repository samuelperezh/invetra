import { NextResponse } from 'next/server';
import Pedido from '@/models/Pedido';
import Usuario from '@/models/Usuario';
import Producto from '@/models/Producto';
import { dbConnect } from '@/utils/mongodb';

// Helper function to fetch user details
async function fetchUserDetails(userId) {
  const response = await fetch(`http://localhost:3000/api/usuarios/${userId}`);
  if (!response.ok) {
    throw new Error('Error fetching user details');
  }
  return response.json();
}

// Helper function to fetch product details
async function fetchProductDetails(productId) {
  const response = await fetch(`http://localhost:3000/api/productos/${productId}`);
  if (!response.ok) {
    throw new Error(`producto_id ${productId} no válido o no existe`);
  }
  return response.json();
}

// Helper function to update product quantity
async function updateProductQuantity(productId, newQuantity) {
  const response = await fetch(`http://localhost:3000/api/productos/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cantidad_disponible: newQuantity })
  });
  if (!response.ok) {
    throw new Error(`Error updating product quantity for producto_id ${productId}`);
  }
  return response.json();
}

// GET pedido by ID
export async function GET(request, { params }) {
  await dbConnect();
  const { id } = params;

  try {
    const pedido = await Pedido.findById(id).populate('vendedor_id asignado_a items.producto_id');
    if (!pedido) {
      return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 });
    }
    return NextResponse.json(pedido);
  } catch (error) {
    return NextResponse.json({ message: `Error al obtener el pedido: ${error.message}` }, { status: 500 });
  }
}

// PUT (update) a specific pedido by ID
export async function PUT(request, { params }) {
  await dbConnect();
  const { id } = params;
  const data = await request.json();

  try {
    const existingPedido = await Pedido.findById(id);
    if (!existingPedido) {
      return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 });
    }

    // Check if vendedor_id exists and is a rol vendedor
    if (data.vendedor_id) {
      const vendedor = await fetchUserDetails(data.vendedor_id);
      if (!vendedor || vendedor.rol !== 'vendedor') {
        return NextResponse.json({ message: 'vendedor_id no válido o no es un vendedor' }, { status: 400 });
      }
    }

    // Check if asignado_a exists and is a rol bodega
    if (data.asignado_a) {
      const asignadoA = await fetchUserDetails(data.asignado_a);
      if (!asignadoA || asignadoA.rol !== 'bodega') {
        return NextResponse.json({ message: 'asignado_a no válido o no es un bodeguero' }, { status: 400 });
      }
    }

    // Check if all producto_id in items exist
    if (data.items) {
      for (const item of data.items) {
        const producto = await fetchProductDetails(item.producto_id);
        if (!producto) {
          return NextResponse.json({ message: `producto_id ${item.producto_id} no válido o no existe` }, { status: 400 });
        }

        const existingItem = existingPedido.items.find(i => i.producto_id.toString() === item.producto_id);
        const originalCantidadSolicitada = existingItem ? existingItem.cantidad_solicitada : 0;

        if (item.cantidad_solicitada > (producto.cantidad_disponible + originalCantidadSolicitada)) {
          return NextResponse.json({ message: `La cantidad solicitada para ${producto.nombre} es mayor a la cantidad disponible` }, { status: 400 });
        }

        // Update product quantity
        const newQuantity = producto.cantidad_disponible + originalCantidadSolicitada - item.cantidad_solicitada;
        await updateProductQuantity(item.producto_id, newQuantity);
      }
    }

    const pedido = await Pedido.findByIdAndUpdate(id, data, { new: true });
    if (!pedido) {
      return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 });
    }
    return NextResponse.json(pedido);
  } catch (error) {
    return NextResponse.json({ message: `Error al actualizar el pedido: ${error.message}` }, { status: 500 });
  }
}

// DELETE (cancel) a specific pedido by ID
export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = params;

  try {
    const pedido = await Pedido.findById(id);
    if (!pedido) {
      return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 });
    }

    // Update product quantities
    for (const item of pedido.items) {
      const producto = await fetchProductDetails(item.producto_id);
      if (!producto) {
        return NextResponse.json({ message: `producto_id ${item.producto_id} no válido o no existe` }, { status: 400 });
      }

      const newQuantity = producto.cantidad_disponible + item.cantidad_solicitada;
      await updateProductQuantity(item.producto_id, newQuantity);
    }

    // Update pedido estado to cancelado and set cantidad_solicitada to 0
    pedido.estado = 'cancelado';
    pedido.items.forEach(item => {
      item.cantidad_solicitada = 0;
    });

    await pedido.save();

    return NextResponse.json({ message: 'Pedido cancelado correctamente' });
  } catch (error) {
    return NextResponse.json({ message: `Error al cancelar el pedido: ${error.message}` }, { status: 500 });
  }
}