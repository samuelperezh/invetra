import { NextResponse } from "next/server";
const { dbConnect } = require('@/utils/mongodb');

export async function GET() {
    dbConnect();
    return NextResponse.json(
        { message: "Hello World" }
    );
}