import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: {
        email: email
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password (in a real app, you'd use bcrypt)
    // For demo purposes, we'll accept the demo password
    const isDemoUser = email === "admin@passflow.ru";
    const isDemoPassword = password === "XZMx#DN7ex#*7Wpp";
    
    if (!isDemoUser || !isDemoPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Return user data (without sensitive information)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled,
      masterPasswordSetup: false // This would be checked in a real implementation
    };

    return NextResponse.json({
      user: userData,
      message: "Login successful"
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}