"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Encryption } from '@/lib/encryption';
import { Shuffle, Copy, Check } from 'lucide-react';

interface PasswordGeneratorProps {
  onPasswordGenerated?: (password: string) => void;
  className?: string;
}

export function PasswordGenerator({ onPasswordGenerated, className }: PasswordGeneratorProps) {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState([16]);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    try {
      const newPassword = Encryption.generatePassword(length[0], options);
      setPassword(newPassword);
      onPasswordGenerated?.(newPassword);
    } catch (error) {
      console.error('Error generating password:', error);
    }
  };

  const copyToClipboard = async () => {
    if (password) {
      try {
        await navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  const handleOptionChange = (key: keyof typeof options, value: boolean) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shuffle className="h-5 w-5" />
          Генератор паролей
        </CardTitle>
        <CardDescription>
          Создайте надежный пароль с настраиваемыми параметрами
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Сгенерированный пароль */}
        <div className="space-y-2">
          <Label htmlFor="generated-password">Сгенерированный пароль</Label>
          <div className="flex gap-2">
            <Input
              id="generated-password"
              value={password}
              readOnly
              placeholder="Нажмите 'Сгенерировать' для создания пароля"
              className="font-mono"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              disabled={!password}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Длина пароля */}
        <div className="space-y-2">
          <Label>Длина пароля: {length[0]}</Label>
          <Slider
            value={length}
            onValueChange={setLength}
            max={32}
            min={8}
            step={1}
            className="w-full"
          />
        </div>

        {/* Опции генерации */}
        <div className="space-y-3">
          <Label>Включить в пароль:</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="uppercase" className="text-sm">Прописные буквы (A-Z)</Label>
              <Switch
                id="uppercase"
                checked={options.uppercase}
                onCheckedChange={(checked) => handleOptionChange('uppercase', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="lowercase" className="text-sm">Строчные буквы (a-z)</Label>
              <Switch
                id="lowercase"
                checked={options.lowercase}
                onCheckedChange={(checked) => handleOptionChange('lowercase', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="numbers" className="text-sm">Цифры (0-9)</Label>
              <Switch
                id="numbers"
                checked={options.numbers}
                onCheckedChange={(checked) => handleOptionChange('numbers', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="symbols" className="text-sm">Символы (!@#$%^&*)</Label>
              <Switch
                id="symbols"
                checked={options.symbols}
                onCheckedChange={(checked) => handleOptionChange('symbols', checked)}
              />
            </div>
          </div>
        </div>

        {/* Кнопка генерации */}
        <Button 
          onClick={generatePassword} 
          className="w-full"
          disabled={!Object.values(options).some(Boolean)}
        >
          <Shuffle className="h-4 w-4 mr-2" />
          Сгенерировать пароль
        </Button>
      </CardContent>
    </Card>
  );
}