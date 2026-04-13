import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

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
