import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { enabled } = await request.json();

    // Здесь будет логика включения/выключения 2FA
    // Для примера просто имитируем процесс
    
    console.log("2FA settings updated for user:", session.user.id, "enabled:", enabled);

    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (enabled) {
      // Генерация секретного ключа для 2FA (в реальном приложении)
      const secret = "JBSWY3DPEHPK3PXP"; // Пример секрета
      const qrCodeUrl = `otpauth://totp/Passflow:${session.user.email}?secret=${secret}&issuer=Passflow`;

      return NextResponse.json({ 
        success: true, 
        enabled: true,
        secret,
        qrCodeUrl,
        message: "Двухфакторная аутентификация включена" 
      });
    } else {
      return NextResponse.json({ 
        success: true, 
        enabled: false,
        message: "Двухфакторная аутентификация отключена" 
      });
    }
  } catch (error) {
    console.error("Error updating 2FA settings:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}