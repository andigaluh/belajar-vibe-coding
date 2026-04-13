import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { email, password, rememberMe } = await request.json();

    // 1. Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: true, message: 'email or password is wrong not null', data: null },
        { status: 400 }
      );
    }

    // 2. Find user by email
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return NextResponse.json(
        { error: true, message: 'email or password is wrong not found', data: null },
        { status: 401 }
      );
    }

    const user = users[0];

    // 3. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: true, message: 'email or password is wrong not match', data: null },
        { status: 401 }
      );
    }

    // 4. Generate JWT
    const secret = process.env.AUTH_SECRET;
    const expiresIn = rememberMe ? '30d' : '24h';
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      secret,
      { expiresIn: expiresIn }
    );

    // 5. Store session in database
    await pool.execute(
      'INSERT INTO sessions (user_id, token) VALUES (?, ?)',
      [user.id, token]
    );

    // 6. Return response
    return NextResponse.json(
      {
        error: false,
        message: 'login success',
        data: {
          token: token,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal server error', data: null },
      { status: 500 }
    );
  }
}
