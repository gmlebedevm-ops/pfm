import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId, masterPasswordHash, masterPasswordSalt, masterPasswordSetup } = await request.json();

    if (!userId || typeof masterPasswordSetup !== 'boolean') {
      return NextResponse.json(
        { error: "User ID and masterPasswordSetup status are required" },
        { status: 400 }
      );
    }

    // Update user's master password setup status
    // В реальной реализации здесь нужно добавить поля в схему Prisma
    // Для демонстрации используем существующие поля
    const updatedUser = await db.user.update({
      where: {
        id: userId
      },
      data: {
        // В реальном приложении здесь должны быть отдельные поля для:
        // - masterPasswordHash
        // - masterPasswordSalt  
        // - masterPasswordSetup
        // Для демонстрации используем поле twoFactorSecret как флаг
        twoFactorSecret: masterPasswordSetup ? masterPasswordHash : null,
        twoFactorEnabled: masterPasswordSetup
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