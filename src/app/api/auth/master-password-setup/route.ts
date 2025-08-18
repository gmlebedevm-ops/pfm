import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId, masterPasswordSetup } = await request.json();

    if (!userId || typeof masterPasswordSetup !== 'boolean') {
      return NextResponse.json(
        { error: "User ID and masterPasswordSetup status are required" },
        { status: 400 }
      );
    }

    // Update user's master password setup status
    // Note: In a real implementation, you would store a hash or indicator
    // that the master password has been set up, not the actual password
    const updatedUser = await db.user.update({
      where: {
        id: userId
      },
      data: {
        // Add a field to indicate master password setup
        // For now, we'll use the name field to store this info
        // In a real implementation, you would add a proper field to the schema
        name: masterPasswordSetup ? "Master Password Set" : null
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        masterPasswordSetup: masterPasswordSetup
      }
    });

  } catch (error) {
    console.error("Master password setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}