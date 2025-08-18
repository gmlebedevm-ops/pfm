import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, code, method } = await request.json();

    if (!email || !code || !method) {
      return NextResponse.json(
        { error: "Email, code, and method are required" },
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
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "2FA is not enabled for this user" },
        { status: 400 }
      );
    }

    // For demo purposes, accept any 6-digit code for app method
    // In a real implementation, you would verify the TOTP code
    if (method === 'app') {
      if (code.length !== 6) {
        return NextResponse.json(
          { error: "Invalid 2FA code" },
          { status: 400 }
        );
      }
      
      // Mock verification - in real app, use TOTP verification
      // For demo, we'll accept any 6-digit code
      return NextResponse.json({
        success: true,
        message: "2FA verification successful"
      });
    }

    // For backup codes, you would check against stored backup codes
    if (method === 'backup') {
      // In a real implementation, you would check against stored backup codes
      // For demo, we'll accept any non-empty code
      if (code.length < 6) {
        return NextResponse.json(
          { error: "Invalid backup code" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Backup code verification successful"
      });
    }

    return NextResponse.json(
      { error: "Invalid verification method" },
      { status: 400 }
    );

  } catch (error) {
    console.error("2FA verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}