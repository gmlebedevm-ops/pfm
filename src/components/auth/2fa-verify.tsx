"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertCircle, Smartphone, Key } from "lucide-react";

interface TwoFactorVerifyProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onUseBackupCode: () => void;
  userEmail: string;
}

export function TwoFactorVerify({ 
  isOpen, 
  onClose, 
  onSuccess, 
  onUseBackupCode, 
  userEmail 
}: TwoFactorVerifyProps) {
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [method, setMethod] = useState<'app' | 'backup'>('app');

  const handleVerify = async () => {
    if (!verificationCode) {
      setError("Please enter a verification code");
      return;
    }

    if (method === 'app' && verificationCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      // Verify the 2FA code with the backend
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          code: verificationCode,
          method: method
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid verification code");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid verification code");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Enter the verification code to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Info */}
          <div className="text-sm text-muted-foreground">
            Signing in as <span className="font-medium">{userEmail}</span>
          </div>

          {/* Method Selection */}
          <div className="flex gap-2">
            <Button
              variant={method === 'app' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMethod('app')}
              className="flex-1"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Authenticator App
            </Button>
            <Button
              variant={method === 'backup' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMethod('backup')}
              className="flex-1"
            >
              <Key className="h-4 w-4 mr-2" />
              Backup Code
            </Button>
          </div>

          {/* Verification Input */}
          {method === 'app' ? (
            <div className="space-y-2">
              <Label htmlFor="app-code">Enter 6-digit code</Label>
              <Input
                id="app-code"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={handleKeyDown}
                maxLength={6}
                className="text-center font-mono text-lg tracking-widest"
                autoFocus
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="backup-code">Enter backup code</Label>
              <Input
                id="backup-code"
                placeholder="Enter backup code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                className="font-mono"
                autoFocus
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={handleVerify} 
              className="w-full"
              disabled={isVerifying || !verificationCode}
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </Button>
            
            {method === 'app' && (
              <Button 
                variant="outline" 
                onClick={onUseBackupCode}
                className="w-full"
              >
                Use Backup Code Instead
              </Button>
            )}
          </div>

          {/* Help Text */}
          <div className="text-xs text-muted-foreground text-center">
            {method === 'app' ? (
              <p>Open your authenticator app to get the verification code</p>
            ) : (
              <p>Enter one of your 10 backup codes</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}