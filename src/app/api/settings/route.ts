import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profile, security, appearance, notifications } = await request.json();

    // Здесь будет логика сохранения настроек в базу данных
    // Для примера просто имитируем сохранение
    
    console.log("Saving settings:", {
      userId: session.user.id,
      profile,
      security,
      appearance,
      notifications
    });

    // Имитация задержки сохранения
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({ 
      success: true, 
      message: "Настройки успешно сохранены" 
    });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}