import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query, queryOne } from "@/db/client";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password, email } = await req.json();

    if (!username || !password || username.length < 3 || password.length < 6) {
      return NextResponse.json(
        { error: "Usuário (mín. 3 chars) e senha (mín. 6 chars) obrigatórios" },
        { status: 400 }
      );
    }

    const existing = await queryOne(
      "SELECT id FROM users WHERE username = $1",
      [username.toLowerCase()]
    );
    if (existing) {
      return NextResponse.json(
        { error: "Usuário já existe" },
        { status: 409 }
      );
    }

    const hash = await bcrypt.hash(password, 10);
    const rows = await query<{ id: string; username: string }>(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username",
      [username.toLowerCase(), email ?? null, hash]
    );
    const user = rows[0];
    const token = signToken({ userId: user.id, username: user.username });

    return NextResponse.json({ token, username: user.username });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
