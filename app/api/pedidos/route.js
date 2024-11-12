import { NextResponse } from 'next/server';
import Pedido from '@/models/Pedido';
import Usuario from '@/models/Usuario'; // Import the Usuario model
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

// GET all pedidos
export async function GET() {
  await dbConnect();
  try {
    const pedidos = await Pedido.find().populate('vendedor_id asignado_a items.producto_id');
    return NextResponse.json(pedidos);
  } catch (error) {
    console.error('Error al obtener los pedidos:', error);
    return NextResponse.json({ message: 'Error al obtener los pedidos', error: error.message }, { status: 500 });
  }
}

// POST a new pedido
export async function POST(request) {
  await dbConnect();
  const data = await request.json();

  try {
    // Check if vendedor_id exists and is a rol vendedor
    const vendedor = await fetchUserDetails(data.vendedor_id);
    if (!vendedor || vendedor.rol !== 'vendedor') {
      return NextResponse.json({ message: 'vendedor_id no válido o no es un vendedor' }, { status: 400 });
    }

    // Check if asignado_a exists and is a rol bodega
    if (data.asignado_a) {
      const asignadoA = await fetchUserDetails(data.asignado_a);
      if (!asignadoA || asignadoA.rol !== 'bodega') {
        return NextResponse.json({ message: 'asignado_a no válido o no es un bodeguero' }, { status: 400 });
      }
    }

    // Check if all producto_id in items exist
    for (const item of data.items) {
      const producto = await fetchProductDetails(item.producto_id);
      if (!producto) {
        return NextResponse.json({ message: `producto_id ${item.producto_id} no válido o no existe` }, { status: 400 });
      }
      if (item.cantidad_solicitada > producto.cantidad_disponible) {
        return NextResponse.json({ message: `La cantidad solicitada para ${producto.nombre} es mayor a la cantidad disponible` }, { status: 400 });
      }
      // Update product quantity
      const newQuantity = producto.cantidad_disponible - item.cantidad_solicitada;
      await updateProductQuantity(item.producto_id, newQuantity);
    }

    const newPedido = new Pedido(data);
    await newPedido.save();
    return NextResponse.json(newPedido, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: `Error al crear el pedido: ${error.message}` }, { status: 500 });
  }
}