"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Shield, 
  UserPlus, 
  Settings, 
  Trash2, 
  Edit,
  Crown,
  UserCheck,
  Users,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  twoFactorEnabled: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface RoleManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoleManagement({ isOpen, onClose }: RoleManagementProps) {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "SUPER_ADMIN",
      twoFactorEnabled: true,
      createdAt: "2024-01-15",
      lastLogin: "2024-06-17"
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "ADMIN",
      twoFactorEnabled: false,
      createdAt: "2024-02-20",
      lastLogin: "2024-06-16"
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      role: "USER",
      twoFactorEnabled: true,
      createdAt: "2024-03-10",
      lastLogin: "2024-06-15"
    },
    {
      id: "4",
      name: "Alice Brown",
      email: "alice.brown@example.com",
      role: "USER",
      twoFactorEnabled: false,
      createdAt: "2024-04-05",
      lastLogin: "2024-06-14"
    }
  ]);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-100 text-red-800 border-red-200';
      case 'ADMIN': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return Crown;
      case 'ADMIN': return Shield;
      default: return UserCheck;
    }
  };

  const handleRoleChange = (userId: string, newRole: 'USER' | 'ADMIN' | 'SUPER_ADMIN') => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return "Full access to all features, user management, and system settings";
      case 'ADMIN':
        return "Can manage users, passwords, and company settings";
      default:
        return "Can manage own passwords and access shared resources";
    }
  };

  const getRolePermissions = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return [
          "Create, read, update, delete all passwords",
          "Manage all users and roles",
          "Access system settings and logs",
          "Manage companies and folders",
          "Full access to all features"
        ];
      case 'ADMIN':
        return [
          "Create, read, update, delete passwords",
          "Manage users (except super admins)",
          "Manage company settings",
          "Create and manage folders",
          "View system logs"
        ];
      default:
        return [
          "Create, read, update, delete own passwords",
          "Access shared passwords",
          "Create personal folders",
          "Enable 2FA"
        ];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Role & User Management
          </CardTitle>
          <CardDescription>
            Manage user roles and permissions for your organization
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Role Definitions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Role Definitions</h3>
              
              {(['SUPER_ADMIN', 'ADMIN', 'USER'] as const).map((role) => {
                const RoleIcon = getRoleIcon(role);
                const userCount = users.filter(u => u.role === role).length;
                
                return (
                  <Card key={role} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <RoleIcon className="h-4 w-4" />
                      <Badge className={getRoleBadgeColor(role)}>
                        {role.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline">{userCount} users</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {getRoleDescription(role)}
                    </p>
                    <div className="space-y-1">
                      <h4 className="text-xs font-medium text-muted-foreground">Permissions:</h4>
                      {getRolePermissions(role).map((permission, index) => (
                        <div key={index} className="flex items-center gap-1 text-xs">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{permission}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* User Management */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Users</h3>
                <Button onClick={() => setIsAddUserOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>2FA</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => {
                      const RoleIcon = getRoleIcon(user.role);
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <RoleIcon className="h-4 w-4" />
                              <Badge className={getRoleBadgeColor(user.role)}>
                                {user.role.replace('_', ' ')}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.twoFactorEnabled ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {user.lastLogin || 'Never'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>

        <div className="border-t p-4 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </Card>
    </div>
  );
}