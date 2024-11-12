import { NextResponse } from 'next/server';
import Producto from '@/models/Producto';
import { dbConnect } from '@/utils/mongodb';

// GET a single producto by ID
export async function GET(request, { params }) {
  await dbConnect();
  const { id } = params;
  try {
    const producto = await Producto.findById(id);
    if (!producto) {
      return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 });
    }
    return NextResponse.json(producto);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener el producto' }, { status: 500 });
  }
}

// PUT to update a producto by ID
export async function PUT(request, { params }) {
  await dbConnect();
  const { id } = params;
  const data = await request.json();
  try {
    const updatedProducto = await Producto.findByIdAndUpdate(id, data, { new: true });
    if (!updatedProducto) {
      return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 });
    }
    return NextResponse.json(updatedProducto);
  } catch (error) {
    return NextResponse.json({ message: 'Error al actualizar el producto' }, { status: 500 });
  }
}

// DELETE a producto by ID
export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = params;
  try {
    const deletedProducto = await Producto.findByIdAndDelete(id);
    if (!deletedProducto) {
      return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Producto eliminado' });
  } catch (error) {
    return NextResponse.json({ message: 'Error al eliminar el producto' }, { status: 500 });
  }
}