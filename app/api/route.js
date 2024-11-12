import { NextResponse } from "next/server";
const { dbConnect } = require('@/utils/mongodb');

export async function GET() {
    dbConnect();
    return NextResponse.json(
        { message: "La API está funcionando correctamente" }
    );
}