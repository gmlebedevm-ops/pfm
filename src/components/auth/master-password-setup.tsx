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
import { encryptionManager, generatePassword } from "@/lib/encryption";

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
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    
    // Character variety
    if (/[a-z]/.test(password)) strength += 10;
    if (/[A-Z]/.test(password)) strength += 10;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
    
    return Math.min(strength, 100);
  };

  const handlePasswordChange = (password: string) => {
    setMasterPassword(password);
    setPasswordStrength(calculatePasswordStrength(password));
    setError("");
  };

  const generateStrongPassword = () => {
    const strongPassword = generatePassword(16);
    setMasterPassword(strongPassword);
    setConfirmPassword("");
    setPasswordStrength(100);
    setError("");
  };

  const handleContinue = () => {
    if (step === 1) {
      if (!masterPassword) {
        setError("Please enter a master password");
        return;
      }
      
      if (passwordStrength < 50) {
        setError("Please choose a stronger password");
        return;
      }
      
      setStep(2);
    } else if (step === 2) {
      if (masterPassword !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      
      setStep(3);
    }
  };

  const handleInitialize = async () => {
    setIsInitializing(true);
    setError("");

    try {
      // Initialize encryption with master password
      await encryptionManager.initialize(masterPassword);
      
      // Save master password setup status to user profile
      if (user?.id) {
        const response = await fetch('/api/auth/master-password-setup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            masterPasswordSetup: true
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save master password setup');
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate initialization
      onComplete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize encryption. Please try again.");
    } finally {
      setIsInitializing(false);
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 30) return "bg-red-500";
    if (strength < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength: number) => {
    if (strength < 30) return "Weak";
    if (strength < 70) return "Medium";
    return "Strong";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Master Password Setup
          </CardTitle>
          <CardDescription>
            {step === 1 && "Create a master password to encrypt your data"}
            {step === 2 && "Confirm your master password"}
            {step === 3 && "Initialize end-to-end encryption"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 1: Create Master Password */}
          {step === 1 && (
            <div className="space-y-4">
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Your master password is used to encrypt all your passwords. 
                  It cannot be recovered if lost.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="master-password">Master Password</Label>
                <div className="relative">
                  <Input
                    id="master-password"
                    type={showPassword ? "text" : "password"}
                    value={masterPassword}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="Enter your master password"
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Password Strength</span>
                      <Badge variant="outline" className={getStrengthColor(passwordStrength)}>
                        {getStrengthText(passwordStrength)}
                      </Badge>
                    </div>
                    <Progress value={passwordStrength} className="h-2" />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={generateStrongPassword} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Strong Password
                </Button>
                <Button onClick={handleContinue} className="flex-1" disabled={!masterPassword}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Confirm Password */}
          {step === 2 && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Please confirm your master password to ensure you remember it correctly.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Master Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your master password"
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
                  Back
                </Button>
                <Button 
                  onClick={handleContinue} 
                  className="flex-1"
                  disabled={!confirmPassword}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Initialize Encryption */}
          {step === 3 && (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your master password will be used to encrypt all your passwords locally on your device.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">End-to-end encryption enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Zero-knowledge architecture</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Client-side encryption only</span>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Store your master password in a safe place. 
                  If you forget it, your data cannot be recovered.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleInitialize} 
                  className="flex-1"
                  disabled={isInitializing}
                >
                  {isInitializing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      Initialize Encryption
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