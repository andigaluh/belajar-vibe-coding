import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { message: 'user_id is required', data: null },
        { status: 400 }
      );
    }

    // Authorization check
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized', data: null },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.AUTH_SECRET);
      
      // Safety check: ensure token belongs to the requested user_id
      if (decoded.id.toString() !== userId.toString()) {
        return NextResponse.json(
          { message: 'Forbidden', data: null },
          { status: 403 }
        );
      }
    } catch (err) {
      return NextResponse.json(
        { message: 'Invalid or expired token', data: null },
        { status: 401 }
      );
    }

    // Query User
    const [users] = await pool.execute(
      'SELECT id, name, email FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { message: 'User not found', data: null },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Success', data: users[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch user error:', error);
    return NextResponse.json(
      { message: 'Internal server error', data: null },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields', data: null },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // SQL Query
    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    const values = [name, email, hashedPassword];

    // Execute query
    const [result] = await pool.execute(query, values);

    // Response data (exclude password)
    const userData = {
      id: result.insertId,
      name,
      email,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(
      { message: 'User created successfully', data: userData },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    
    // Check for duplicate email error (MySQL error code 1062)
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { message: 'Email already exists', data: null },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'User created failed', data: null },
      { status: 500 }
    );
  }
}
