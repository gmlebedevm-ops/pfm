"use client";

import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Encryption } from '@/lib/encryption';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const [strength, setStrength] = useState<{
    score: number;
    strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
    feedback: string[];
  }>({ score: 0, strength: 'very-weak', feedback: [] });

  useEffect(() => {
    if (password) {
      const assessment = Encryption.assessPasswordStrength(password);
      setStrength(assessment);
    } else {
      setStrength({ score: 0, strength: 'very-weak', feedback: [] });
    }
  }, [password]);

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'very-weak':
        return 'bg-red-500';
      case 'weak':
        return 'bg-orange-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'good':
        return 'bg-green-500';
      case 'strong':
        return 'bg-green-600';
      default:
        return 'bg-gray-500';
    }
  };

  const getStrengthLabel = (strength: string) => {
    switch (strength) {
      case 'very-weak':
        return 'Очень слабый';
      case 'weak':
        return 'Слабый';
      case 'fair':
        return 'Средний';
      case 'good':
        return 'Хороший';
      case 'strong':
        return 'Отличный';
      default:
        return 'Неизвестно';
    }
  };

  const getStrengthVariant = (strength: string) => {
    switch (strength) {
      case 'very-weak':
        return 'destructive';
      case 'weak':
        return 'secondary';
      case 'fair':
        return 'outline';
      case 'good':
        return 'default';
      case 'strong':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getStrengthIcon = (strength: string) => {
    switch (strength) {
      case 'very-weak':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'weak':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'fair':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'strong':
        return <Shield className="h-4 w-4 text-green-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStrengthDescription = (strength: string) => {
    switch (strength) {
      case 'very-weak':
        return 'Пароль легко взломать - срочно нужно улучшить';
      case 'weak':
        return 'Пароль нуждается в улучшении';
      case 'fair':
        return 'Пароль приемлемый, но можно сделать лучше';
      case 'good':
        return 'Хороший надежный пароль';
      case 'strong':
        return 'Отличный пароль - максимальная защита';
      default:
        return '';
    }
  };

  const getSegmentColors = (strength: string) => {
    switch (strength) {
      case 'very-weak':
        return ['bg-red-500', 'bg-gray-300', 'bg-gray-300', 'bg-gray-300', 'bg-gray-300'];
      case 'weak':
        return ['bg-red-500', 'bg-orange-500', 'bg-gray-300', 'bg-gray-300', 'bg-gray-300'];
      case 'fair':
        return ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-gray-300', 'bg-gray-300'];
      case 'good':
        return ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-gray-300'];
      case 'strong':
        return ['bg-green-500', 'bg-green-500', 'bg-green-500', 'bg-green-500', 'bg-green-600'];
      default:
        return ['bg-gray-300', 'bg-gray-300', 'bg-gray-300', 'bg-gray-300', 'bg-gray-300'];
    }
  };

  const progressValue = (strength.score / 4) * 100;
  const segmentColors = getSegmentColors(strength.strength);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Стойкость пароля:</span>
          {getStrengthIcon(strength.strength)}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStrengthVariant(strength.strength)} className="text-xs">
            {getStrengthLabel(strength.strength)}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {progressValue.toFixed(0)}%
          </span>
        </div>
      </div>
      
      {/* Улучшенный сегментированный прогресс-бар */}
      <div className="space-y-1">
        <div className="flex gap-1 h-3 w-full">
          <div className={`flex-1 rounded-l-sm ${segmentColors[0]} transition-all duration-300`} />
          <div className={`flex-1 ${segmentColors[1]} transition-all duration-300`} />
          <div className={`flex-1 ${segmentColors[2]} transition-all duration-300`} />
          <div className={`flex-1 ${segmentColors[3]} transition-all duration-300`} />
          <div className={`flex-1 rounded-r-sm ${segmentColors[4]} transition-all duration-300`} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>
      
      {/* Описание уровня стойкости */}
      {password && (
        <p className="text-xs text-muted-foreground">
          {getStrengthDescription(strength.strength)}
        </p>
      )}
      
      {/* Детальная обратная связь */}
      {strength.feedback.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            Рекомендации по улучшению:
          </div>
          <div className="space-y-1">
            {strength.feedback.map((feedback, index) => (
              <div key={index} className="flex items-start gap-2 text-xs">
                <span className="text-yellow-500 mt-0.5">•</span>
                <span className="text-muted-foreground">{feedback}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Чеклист требований к паролю */}
      {password && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            Требования к надежному паролю:
          </div>
          <div className="grid grid-cols-1 gap-1">
            <div className="flex items-center gap-2 text-xs">
              {password.length >= 12 ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : password.length >= 8 ? (
                <AlertTriangle className="h-3 w-3 text-yellow-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span className={
                password.length >= 12 
                  ? "text-green-600" 
                  : password.length >= 8 
                    ? "text-yellow-600" 
                    : "text-muted-foreground"
              }>
                Длина: {password.length} символов {password.length >= 12 ? "(отлично)" : password.length >= 8 ? "(минимум)" : "(нужно минимум 8)"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {/[a-z]/.test(password) ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span className={/[a-z]/.test(password) ? "text-green-600" : "text-muted-foreground"}>
                Строчные буквы (a-z)
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {/[A-Z]/.test(password) ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span className={/[A-Z]/.test(password) ? "text-green-600" : "text-muted-foreground"}>
                Заглавные буквы (A-Z)
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {/[0-9]/.test(password) ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span className={/[0-9]/.test(password) ? "text-green-600" : "text-muted-foreground"}>
                Цифры (0-9)
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {/[^a-zA-Z0-9]/.test(password) ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span className={/[^a-zA-Z0-9]/.test(password) ? "text-green-600" : "text-muted-foreground"}>
                Специальные символы (!@#$%^&*)
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Индикатор общего прогресса */}
      {password && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">
            Общий прогресс надежности:
          </div>
          <Progress 
            value={progressValue} 
            className={`h-2 ${getStrengthColor(strength.strength)}`}
          />
        </div>
      )}
    </div>
  );
}