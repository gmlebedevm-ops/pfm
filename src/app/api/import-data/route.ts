import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('importFile') as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Проверка типа файла
    if (!file.name.endsWith('.json')) {
      return NextResponse.json({ 
        error: "Invalid file type. Only JSON files are allowed" 
      }, { status: 400 });
    }

    // Проверка размера файла (максимально 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "File too large. Maximum size is 10MB" 
      }, { status: 400 });
    }

    // Чтение и парсинг файла
    const text = await file.text();
    let importData;
    
    try {
      importData = JSON.parse(text);
    } catch (error) {
      return NextResponse.json({ 
        error: "Invalid JSON format" 
      }, { status: 400 });
    }

    // Валидация структуры данных
    if (!importData.version || !importData.exportDate) {
      return NextResponse.json({ 
        error: "Invalid backup file format" 
      }, { status: 400 });
    }

    // Здесь будет логика импорта данных в базу данных
    console.log("Importing data for user:", session.user.id);
    console.log("Data structure:", {
      hasPasswords: !!importData.passwords,
      hasFolders: !!importData.folders,
      hasCompanies: !!importData.companies,
      passwordCount: importData.passwords?.length || 0,
      folderCount: importData.folders?.length || 0,
      companyCount: importData.companies?.length || 0,
    });

    // Имитация задержки импорта
    await new Promise(resolve => setTimeout(resolve, 2000));

    return NextResponse.json({ 
      success: true, 
      imported: {
        passwords: importData.passwords?.length || 0,
        folders: importData.folders?.length || 0,
        companies: importData.companies?.length || 0,
      },
      message: "Данные успешно импортированы" 
    });
  } catch (error) {
    console.error("Error importing data:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}