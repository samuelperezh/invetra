import { NextResponse } from 'next/server';
import Pedido from '@/models/Pedido';
import { dbConnect } from '@/utils/mongodb';

// GET a single pedido by ID
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
    return NextResponse.json({ message: 'Error al obtener el pedido' }, { status: 500 });
  }
}

// PUT to update a pedido by ID
export async function PUT(request, { params }) {
  await dbConnect();
  const { id } = params;
  const data = await request.json();
  try {
    const updatedPedido = await Pedido.findByIdAndUpdate(id, data, { new: true }).populate('vendedor_id asignado_a items.producto_id');
    if (!updatedPedido) {
      return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 });
    }
    return NextResponse.json(updatedPedido);
  } catch (error) {
    return NextResponse.json({ message: 'Error al actualizar el pedido' }, { status: 500 });
  }
}

// DELETE a pedido by ID
export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = params;
  try {
    const deletedPedido = await Pedido.findByIdAndDelete(id);
    if (!deletedPedido) {
      return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Pedido eliminado' });
  } catch (error) {
    return NextResponse.json({ message: 'Error al eliminar el pedido' }, { status: 500 });
  }
}