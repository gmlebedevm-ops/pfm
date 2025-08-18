"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  Lock,
  Unlock,
  RefreshCw
} from "lucide-react";
import { Encryption } from "@/lib/encryption";
import { PasswordStrength } from "@/components/ui/password-strength";

interface MasterPasswordSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  user?: any;
}

export function MasterPasswordSetup({ isOpen, onClose, onComplete, user }: MasterPasswordSetupProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [masterPassword, setMasterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState("");

  const handlePasswordChange = (password: string) => {
    setMasterPassword(password);
    setError("");
  };

  const generateStrongPassword = () => {
    try {
      const strongPassword = Encryption.generatePassword(16, {
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true
      });
      setMasterPassword(strongPassword);
      setConfirmPassword("");
      setError("");
    } catch (error) {
      setError("Ошибка генерации пароля");
    }
  };

  const validateMasterPassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 12) {
      errors.push("Мастер-пароль должен содержать минимум 12 символов");
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("Добавьте строчные буквы (a-z)");
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("Добавьте заглавные буквы (A-Z)");
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push("Добавьте цифры (0-9)");
    }
    
    if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.push("Добавьте специальные символы (!@#$%^&*)");
    }
    
    return errors;
  };

  const handleContinue = () => {
    if (step === 1) {
      if (!masterPassword) {
        setError("Введите мастер-пароль");
        return;
      }
      
      const errors = validateMasterPassword(masterPassword);
      if (errors.length > 0) {
        setError(errors.join(". "));
        return;
      }
      
      setStep(2);
    } else if (step === 2) {
      if (masterPassword !== confirmPassword) {
        setError("Пароли не совпадают");
        return;
      }
      
      setStep(3);
    }
  };

  const handleInitialize = async () => {
    setIsInitializing(true);
    setError("");

    try {
      // Хешируем мастер-пароль для сохранения
      const { hash, salt } = Encryption.hashMasterPassword(masterPassword);
      
      // Сохраняем хеш мастер-пароля в профиле пользователя
      if (user?.id) {
        const response = await fetch('/api/auth/master-password-setup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            masterPasswordHash: hash,
            masterPasswordSalt: salt,
            masterPasswordSetup: true
          }),
        });

        if (!response.ok) {
          throw new Error('Не удалось сохранить мастер-пароль');
        }
      }
      
      // Сохраняем мастер-пароль в sessionStorage для текущей сессии
      // В реальном приложении это должно быть более безопасно
      sessionStorage.setItem('masterPassword', masterPassword);
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate initialization
      onComplete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось инициализировать шифрование. Попробуйте еще раз.");
    } finally {
      setIsInitializing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Установка мастер-пароля
          </CardTitle>
          <CardDescription>
            {step === 1 && "Создайте мастер-пароль для шифрования ваших данных"}
            {step === 2 && "Подтвердите ваш мастер-пароль"}
            {step === 3 && "Инициализация сквозного шифрования"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Шаг 1: Создание мастер-пароля */}
          {step === 1 && (
            <div className="space-y-4">
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Ваш мастер-пароль используется для шифрования всех ваших паролей. 
                  Он не может быть восстановлен в случае утери.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="master-password">Мастер-пароль</Label>
                <div className="relative">
                  <Input
                    id="master-password"
                    type={showPassword ? "text" : "password"}
                    value={masterPassword}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="Введите ваш мастер-пароль"
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                
                {masterPassword && (
                  <PasswordStrength password={masterPassword} />
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={generateStrongPassword} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Сгенерировать надежный пароль
                </Button>
                <Button onClick={handleContinue} className="flex-1" disabled={!masterPassword}>
                  Продолжить
                </Button>
              </div>
            </div>
          )}

          {/* Шаг 2: Подтверждение пароля */}
          {step === 2 && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Пожалуйста, подтвердите ваш мастер-пароль, чтобы убедиться, что вы запомнили его правильно.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Подтвердите мастер-пароль</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Подтвердите ваш мастер-пароль"
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Назад
                </Button>
                <Button 
                  onClick={handleContinue} 
                  className="flex-1"
                  disabled={!confirmPassword}
                >
                  Продолжить
                </Button>
              </div>
            </div>
          )}

          {/* Шаг 3: Инициализация шифрования */}
          {step === 3 && (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Ваш мастер-пароль будет использоваться для шифрования всех ваших паролей локально на вашем устройстве.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Сквозное шифрование включено</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Архитектура с нулевым разглашением</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Только клиентское шифрование</span>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Важно:</strong> Сохраните ваш мастер-пароль в надежном месте. 
                  Если вы забудете его, ваши данные не могут быть восстановлены.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Назад
                </Button>
                <Button 
                  onClick={handleInitialize} 
                  className="flex-1"
                  disabled={isInitializing}
                >
                  {isInitializing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Инициализация...
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      Инициализировать шифрование
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}