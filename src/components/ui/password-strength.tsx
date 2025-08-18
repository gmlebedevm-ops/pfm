"use client";

import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Encryption } from '@/lib/encryption';

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
        return 'bg-lime-500';
      case 'strong':
        return 'bg-green-500';
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
        return 'Сильный';
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

  const progressValue = (strength.score / 4) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Стойкость пароля:</span>
        <Badge variant={getStrengthVariant(strength.strength)}>
          {getStrengthLabel(strength.strength)}
        </Badge>
      </div>
      
      <Progress 
        value={progressValue} 
        className={`h-2 ${getStrengthColor(strength.strength)}`}
      />
      
      {strength.feedback.length > 0 && (
        <div className="text-xs text-muted-foreground space-y-1">
          {strength.feedback.map((feedback, index) => (
            <div key={index} className="flex items-center gap-1">
              <span className="text-yellow-500">•</span>
              <span>{feedback}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}