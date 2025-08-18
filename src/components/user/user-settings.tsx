"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Shield, 
  Key, 
  User, 
  Mail, 
  Smartphone, 
  Download, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Users,
  Share
} from "lucide-react";
import { TwoFactorSetup } from "@/components/auth/2fa-setup";
import { MasterPasswordSetup } from "@/components/auth/master-password-setup";
import { RoleManagement } from "@/components/admin/role-management";
import { PermissionManagement } from "@/components/admin/permission-management";

interface UserSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserData {
  name: string;
  email: string;
  avatar?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodes?: string[];
}

export function UserSettings({ isOpen, onClose }: UserSettingsProps) {
  const [userData, setUserData] = useState<UserData>({
    name: "John Doe",
    email: "john.doe@example.com",
    role: "USER",
    twoFactorEnabled: false,
    backupCodes: []
  });

  const [is2FASetupOpen, setIs2FASetupOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isRoleManagementOpen, setIsRoleManagementOpen] = useState(false);
  const [isPermissionManagementOpen, setIsPermissionManagementOpen] = useState(false);
  const [isMasterPasswordSetupOpen, setIsMasterPasswordSetupOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: userData.name,
    email: userData.email
  });

  const handle2FASetup = (secret: string, backupCodes: string[]) => {
    setUserData(prev => ({
      ...prev,
      twoFactorEnabled: true,
      twoFactorSecret: secret,
      backupCodes
    }));
    setIs2FASetupOpen(false);
  };

  const handleDisable2FA = () => {
    setUserData(prev => ({
      ...prev,
      twoFactorEnabled: false,
      twoFactorSecret: undefined,
      backupCodes: []
    }));
  };

  const handleSaveProfile = () => {
    setUserData(prev => ({
      ...prev,
      name: editForm.name,
      email: editForm.email
    }));
    setIsEditing(false);
  };

  const handleDownloadBackupCodes = () => {
    if (userData.backupCodes && userData.backupCodes.length > 0) {
      const content = userData.backupCodes.join('\n');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'passflow-backup-codes.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-100 text-red-800';
      case 'ADMIN': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Manage your account settings and security preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={userData.avatar} />
                  <AvatarFallback>
                    {userData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Profile</h3>
                    <Badge className={getRoleBadgeColor(userData.role)}>
                      {userData.role.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Manage your personal information
                  </p>
                </div>
                {!isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile}>Save</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{userData.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{userData.email}</span>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Security Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </h3>

              {/* End-to-End Encryption */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">End-to-End Encryption</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Encrypt your passwords locally before they leave your device
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsMasterPasswordSetupOpen(true)}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Setup
                  </Button>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    End-to-end encryption is enabled. Your passwords are encrypted with your master key before being stored.
                  </AlertDescription>
                </Alert>
              </div>

              {/* Two-Factor Authentication */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="font-medium">Two-Factor Authentication</span>
                      {userData.twoFactorEnabled && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={userData.twoFactorEnabled}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setIs2FASetupOpen(true);
                      } else {
                        handleDisable2FA();
                      }
                    }}
                  />
                </div>

                {userData.twoFactorEnabled && (
                  <div className="space-y-3">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Two-factor authentication is enabled on your account
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleDownloadBackupCodes}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Backup Codes
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIs2FASetupOpen(true)}
                        className="flex items-center gap-1"
                      >
                        <Key className="h-4 w-4" />
                        Regenerate Codes
                      </Button>
                    </div>
                  </div>
                )}

                {!userData.twoFactorEnabled && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Enable two-factor authentication to enhance your account security
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <Separator />

            {/* Admin Section - Only visible for ADMIN and SUPER_ADMIN */}
            {(userData.role === 'ADMIN' || userData.role === 'SUPER_ADMIN') && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Administration
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Role Management */}
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">User Management</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Manage user roles and permissions
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setIsRoleManagementOpen(true)}
                    >
                      Manage Users
                    </Button>
                  </div>

                  {/* Permission Management */}
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Share className="h-4 w-4" />
                      <span className="font-medium">Access Control</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Manage shared resources and permissions
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setIsPermissionManagementOpen(true)}
                    >
                      Manage Permissions
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Danger Zone */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
              <div className="space-y-2 p-4 border border-destructive/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-4">
              <Button onClick={onClose}>Close</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <TwoFactorSetup
        isOpen={is2FASetupOpen}
        onClose={() => setIs2FASetupOpen(false)}
        onComplete={handle2FASetup}
      />

      <MasterPasswordSetup
        isOpen={isMasterPasswordSetupOpen}
        onClose={() => setIsMasterPasswordSetupOpen(false)}
        onComplete={() => {
          // Handle encryption initialization complete
        }}
      />

      <RoleManagement
        isOpen={isRoleManagementOpen}
        onClose={() => setIsRoleManagementOpen(false)}
      />

      <PermissionManagement
        isOpen={isPermissionManagementOpen}
        onClose={() => setIsPermissionManagementOpen(false)}
      />
    </>
  );
}