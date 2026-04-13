import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { status: false, message: 'Token and Password are required' },
        { status: 400 }
      );
    }

    // 1. Validate token (exists and not expired)
    const [tokens] = await pool.execute(
      'SELECT user_id FROM users_tokens WHERE token = ? AND expired_at > NOW()',
      [token]
    );

    if (tokens.length === 0) {
      return NextResponse.json(
        { status: false, message: 'Token tidak valid atau sudah kadaluwarsa' },
        { status: 400 }
      );
    }

    const userId = tokens[0].user_id;

    // 2. Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Update user password
    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    // 4. Delete the used token
    await pool.execute('DELETE FROM users_tokens WHERE token = ?', [token]);

    return NextResponse.json(
      { status: true, message: 'Password berhasil direset' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { status: false, message: 'Terjadi kesalahan sistem' },
      { status: 500 }
    );
  }
}
