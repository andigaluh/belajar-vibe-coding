import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { status: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // 1. Check if user exists
    const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return NextResponse.json(
        { status: false, message: 'email tidak terdaftar' },
        { status: 400 }
      );
    }
    const userId = users[0].id;

    // 2. Check if recent token exists (within 1 hour)
    const [recentTokens] = await pool.execute(
      'SELECT id FROM users_tokens WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)',
      [userId]
    );

    if (recentTokens.length > 0) {
      return NextResponse.json(
        { status: false, message: 'anda sudah pernah melakukan reset password dalam 1 jam terakhir' },
        { status: 400 }
      );
    }

    // 3. Generate token and expiry (1 hour)
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // 4. Store token
    await pool.execute(
      'INSERT INTO users_tokens (user_id, token, expired_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );

    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password/${token}`;

    // 5. Send Email or Log to Console
    if (process.env.NODE_ENV === 'development') {
      console.log('--- FORGET PASSWORD RESET LINK ---');
      console.log(`User: ${email}`);
      console.log(`Link: ${resetLink}`);
      console.log('---------------------------------');
    } else {
      // Production path with nodemailer (requires SMTP config in .env)
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Support" <${process.env.SMTP_FROM || 'support@example.com'}>`,
        to: email,
        subject: 'Reset Password Request',
        html: `<p>You requested a password reset. Click the link below to reset your password (valid for 1 hour):</p>
               <p><a href="${resetLink}">${resetLink}</a></p>`,
      });
    }

    return NextResponse.json(
      { status: true, message: 'link konfirmasi berhasil terkirim ke email anda. silakan cek email' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forget password error:', error);
    return NextResponse.json(
      { status: false, message: 'Terjadi kesalahan sistem' },
      { status: 500 }
    );
  }
}
