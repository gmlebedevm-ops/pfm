"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { Copy, CheckCircle, AlertCircle, Shield, Key } from "lucide-react";

interface TwoFactorSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (secret: string, backupCodes: string[]) => void;
}

export function TwoFactorSetup({ isOpen, onClose, onComplete }: TwoFactorSetupProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [secret, setSecret] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Generate 2FA secret when component mounts
  useEffect(() => {
    if (isOpen && step === 1) {
      generate2FASecret();
    }
  }, [isOpen, step]);

  const generate2FASecret = async () => {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll generate a mock secret
      const mockSecret = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
      const mockBackupCodes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );
      
      setSecret(mockSecret);
      setBackupCodes(mockBackupCodes);
      
      // Create QR code URL (otpauth://totp/Passflow:user@example.com?secret=SECRET&issuer=Passflow)
      const userEmail = "user@example.com"; // This would come from the current user
      const qrUrl = `otpauth://totp/Passflow:${userEmail}?secret=${mockSecret}&issuer=Passflow`;
      setQrCodeUrl(qrUrl);
    } catch (err) {
      setError("Failed to generate 2FA secret");
    }
  };

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy secret");
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      // In a real implementation, this would verify the code with the backend
      // For demo purposes, we'll accept any 6-digit code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStep(3);
      onComplete(secret, backupCodes);
    } catch (err) {
      setError("Invalid verification code");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'passflow-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication Setup
          </CardTitle>
          <CardDescription>
            {step === 1 && "Add an extra layer of security to your account"}
            {step === 2 && "Verify your setup with your authenticator app"}
            {step === 3 && "Save your backup codes"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 1: Show QR Code */}
          {step === 1 && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg">
                  <QRCodeSVG value={qrCodeUrl} size={200} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secret">Manual Entry Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="secret"
                    value={secret}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopySecret}
                    className="flex items-center gap-1"
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
              
              <Button onClick={() => setStep(2)} className="w-full">
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Verification */}
          {step === 2 && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Enter the 6-digit code from your authenticator app
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center font-mono text-lg tracking-widest"
                />
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleVerify} 
                  className="flex-1"
                  disabled={isVerifying || verificationCode.length !== 6}
                >
                  {isVerifying ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Backup Codes */}
          {step === 3 && (
            <div className="space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <Badge key={index} variant="outline" className="font-mono text-sm justify-center p-2">
                    {code}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDownloadBackupCodes} className="flex-1">
                  Download Codes
                </Button>
                <Button onClick={onClose} className="flex-1">
                  Complete Setup
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}