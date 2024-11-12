import { NextResponse } from 'next/server';
import Usuario from '@/models/Usuario';
import { dbConnect } from '@/utils/mongodb';

export async function GET(request, { params }) {
  await dbConnect();
  const { id } = params;

  try {
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }
    return NextResponse.json(usuario);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener el usuario' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  await dbConnect();
  const { id } = params;
  const data = await request.json();

  try {
    const usuario = await Usuario.findByIdAndUpdate(id, data, { new: true });
    if (!usuario) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }
    return NextResponse.json(usuario);
  } catch (error) {
    return NextResponse.json({ message: 'Error al actualizar el usuario' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = params;

  try {
    const usuario = await Usuario.findByIdAndDelete(id);
    if (!usuario) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Usuario eliminado' });
  } catch (error) {
    return NextResponse.json({ message: 'Error al eliminar el usuario' }, { status: 500 });
  }
}