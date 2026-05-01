import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { queryOne } from "@/db/client";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Credenciais obrigatórias" }, { status: 400 });
    }

    const user = await queryOne<{
      id: string;
      username: string;
      password_hash: string;
    }>("SELECT id, username, password_hash FROM users WHERE username = $1", [
      username.toLowerCase(),
    ]);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return NextResponse.json({ error: "Usuário ou senha incorretos" }, { status: 401 });
    }

    const token = signToken({ userId: user.id, username: user.username });
    return NextResponse.json({ token, username: user.username });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
