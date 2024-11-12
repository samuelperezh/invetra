import { NextResponse } from 'next/server';
import Usuario from '@/models/Usuario';
import { dbConnect } from '@/utils/mongodb';

export async function GET() {
  await dbConnect();

  try {
    const usuarios = await Usuario.find();
    return NextResponse.json(usuarios);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener los usuarios' }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  const data = await request.json();

  try {
    const usuario = new Usuario(data);
    await usuario.save();
    return NextResponse.json(usuario, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error al crear el usuario' }, { status: 500 });
  }
}

export async function PUT(request) {
    await dbConnect();
    const data = await request.json();
    const { email, ...updateData } = data;

    try {
        const usuario = await Usuario.findOneAndUpdate({ email }, updateData, { new: true });
        if (!usuario) {
            return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
        }
        return NextResponse.json(usuario);
    } catch (error) {
        return NextResponse.json({ message: 'Error al actualizar el usuario' }, { status: 500 });
    }
}

export async function DELETE(request) {
    await dbConnect();
    const { email } = await request.json();

    try {
        const usuario = await Usuario.findOneAndDelete({ email });
        if (!usuario) {
            return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        return NextResponse.json({ message: 'Error al eliminar el usuario' }, { status: 500 });
    }
}