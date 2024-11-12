// app/api/login/route.js
import { NextResponse } from 'next/server';
import Usuario from '@/models/Usuario';
import { dbConnect } from '@/utils/mongodb';
import bcrypt from 'bcrypt';

export async function POST(request) {
  await dbConnect();
  const { email, contraseña } = await request.json();

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!isMatch) {
      return NextResponse.json({ message: 'Contraseña incorrecta' }, { status: 401 });
    }

    // Authentication successful
    // Exclude the password before sending the user data
    const { contraseña: _, ...userData } = usuario.toObject();
    return NextResponse.json(userData, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error al iniciar sesión' }, { status: 500 });
  }
}