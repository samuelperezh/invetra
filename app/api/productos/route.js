import { NextResponse } from 'next/server';
import Producto from '@/models/Producto';
import { dbConnect } from '@/utils/mongodb';

// GET all productos
export async function GET() {
  await dbConnect();
  try {
    const productos = await Producto.find();
    return NextResponse.json(productos);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener los productos' }, { status: 500 });
  }
}

// POST a new producto
export async function POST(request) {
  await dbConnect();
  const data = await request.json();
  try {
    const newProducto = new Producto(data);
    await newProducto.save();
    return NextResponse.json(newProducto, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error al crear el producto' }, { status: 500 });
  }
}

// PUT update producto by codigo_barras
export async function PUT(request) {
    await dbConnect();
    const data = await request.json();
    const { codigo_barras } = data;

    try {
        const updatedProducto = await Producto.findOneAndUpdate({ codigo_barras }, data, { new: true });
        if (!updatedProducto) {
            return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 });
        }
        return NextResponse.json(updatedProducto);
    } catch (error) {
        return NextResponse.json({ message: 'Error al actualizar el producto' }, { status: 500 });
    }
}

// DELETE a producto by codigo_barras
export async function DELETE(request) {
    await dbConnect();
    const { codigo_barras } = await request.json();

    try {
        const deletedProducto = await Producto.findOneAndDelete({ codigo_barras });
        if (!deletedProducto) {
            return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        return NextResponse.json({ message: 'Error al eliminar el producto' }, { status: 500 });
    }
}