// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import Usuario from '@/models/Usuario';
import { dbConnect } from '@/utils/mongodb';
import bcrypt from 'bcrypt';

export async function POST(request) {
  await dbConnect();
  const { username, password } = await request.json();

  try {
    const user = await Usuario.findOne({ email: username });
    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.contraseña);
    if (!passwordMatch) {
      return NextResponse.json({ message: 'Credenciales inválidas' }, { status: 401 });
    }

    // Exclude sensitive fields before responding
    const { contraseña, ...userData } = user.toObject();

    return NextResponse.json(userData);
  } catch (error) {
    return NextResponse.json({ message: 'Error en la autenticación' }, { status: 500 });
  }
}