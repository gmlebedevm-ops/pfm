"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Shield, 
  Share, 
  Users, 
  Folder,
  Key,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  UserPlus
} from "lucide-react";

interface SharedResource {
  id: string;
  name: string;
  type: 'password' | 'folder';
  owner: string;
  sharedWith: SharedUser[];
  createdAt: string;
}

interface SharedUser {
  id: string;
  name: string;
  email: string;
  permission: 'READ' | 'WRITE' | 'ADMIN';
  sharedAt: string;
}

interface PermissionManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PermissionManagement({ isOpen, onClose }: PermissionManagementProps) {
  const [sharedResources, setSharedResources] = useState<SharedResource[]>([
    {
      id: "1",
      name: "Company Database",
      type: "password",
      owner: "John Doe",
      sharedWith: [
        { id: "2", name: "Jane Smith", email: "jane@example.com", permission: "ADMIN", sharedAt: "2024-06-10" },
        { id: "3", name: "Bob Johnson", email: "bob@example.com", permission: "WRITE", sharedAt: "2024-06-12" }
      ],
      createdAt: "2024-06-01"
    },
    {
      id: "2",
      name: "Financial Reports",
      type: "folder",
      owner: "John Doe",
      sharedWith: [
        { id: "2", name: "Jane Smith", email: "jane@example.com", permission: "READ", sharedAt: "2024-06-15" }
      ],
      createdAt: "2024-06-05"
    },
    {
      id: "3",
      name: "Development Servers",
      type: "password",
      owner: "Jane Smith",
      sharedWith: [
        { id: "3", name: "Bob Johnson", email: "bob@example.com", permission: "WRITE", sharedAt: "2024-06-14" },
        { id: "4", name: "Alice Brown", email: "alice@example.com", permission: "READ", sharedAt: "2024-06-16" }
      ],
      createdAt: "2024-06-08"
    }
  ]);

  const [selectedResource, setSelectedResource] = useState<SharedResource | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  const getPermissionBadgeColor = (permission: string) => {
    switch (permission) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'WRITE': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'ADMIN': return Shield;
      case 'WRITE': return Edit;
      default: return Eye;
    }
  };

  const getPermissionDescription = (permission: string) => {
    switch (permission) {
      case 'ADMIN':
        return "Full control - can view, edit, delete, and manage sharing";
      case 'WRITE':
        return "Can view and edit, but cannot delete or manage sharing";
      default:
        return "Can only view, cannot edit or delete";
    }
  };

  const handleRemoveAccess = (resourceId: string, userId: string) => {
    setSharedResources(prev => prev.map(resource => 
      resource.id === resourceId 
        ? { ...resource, sharedWith: resource.sharedWith.filter(user => user.id !== userId) }
        : resource
    ));
  };

  const handleChangePermission = (resourceId: string, userId: string, newPermission: 'READ' | 'WRITE' | 'ADMIN') => {
    setSharedResources(prev => prev.map(resource => 
      resource.id === resourceId 
        ? {
            ...resource,
            sharedWith: resource.sharedWith.map(user => 
              user.id === userId ? { ...user, permission: newPermission } : user
            )
          }
        : resource
    ));
  };

  const filteredResources = sharedResources.filter(resource =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Permission Management
          </CardTitle>
          <CardDescription>
            Manage access permissions for passwords and folders
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-4">
            <Button onClick={() => setIsShareDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Share Resource
            </Button>
          </div>

          {/* Shared Resources Table */}
          <div className="border rounded-lg overflow-hidden flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Shared With</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {resource.type === 'password' ? (
                          <Key className="h-4 w-4" />
                        ) : (
                          <Folder className="h-4 w-4" />
                        )}
                        <span className="font-medium">{resource.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {resource.type === 'password' ? 'Password' : 'Folder'}
                      </Badge>
                    </TableCell>
                    <TableCell>{resource.owner}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{resource.sharedWith.length}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {resource.createdAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedResource(resource)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Permission Details Panel */}
          {selectedResource && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {selectedResource.type === 'password' ? (
                    <Key className="h-5 w-5" />
                  ) : (
                    <Folder className="h-5 w-5" />
                  )}
                  {selectedResource.name}
                </CardTitle>
                <CardDescription>
                  Owner: {selectedResource.owner} • Shared with {selectedResource.sharedWith.length} users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Access Permissions</h4>
                    <Button size="sm" onClick={() => setIsShareDialogOpen(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {selectedResource.sharedWith.map((user) => {
                      const PermissionIcon = getPermissionIcon(user.permission);
                      return (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Select
                              value={user.permission}
                              onValueChange={(value) => handleChangePermission(selectedResource.id, user.id, value as any)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="READ">
                                  <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    Read
                                  </div>
                                </SelectItem>
                                <SelectItem value="WRITE">
                                  <div className="flex items-center gap-2">
                                    <Edit className="h-4 w-4" />
                                    Write
                                  </div>
                                </SelectItem>
                                <SelectItem value="ADMIN">
                                  <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Admin
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Badge className={getPermissionBadgeColor(user.permission)}>
                              {user.permission}
                            </Badge>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAccess(selectedResource.id, user.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>

        <div className="border-t p-4 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {filteredResources.length} resources shared
          </div>
          <Button onClick={onClose}>Close</Button>
        </div>
      </Card>

      {/* Share Resource Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Resource</DialogTitle>
            <DialogDescription>
              Select a resource and user to share with
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resource-select">Resource</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a resource" />
                </SelectTrigger>
                <SelectContent>
                  {sharedResources.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      <div className="flex items-center gap-2">
                        {resource.type === 'password' ? (
                          <Key className="h-4 w-4" />
                        ) : (
                          <Folder className="h-4 w-4" />
                        )}
                        {resource.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="user-select">User</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user1">John Doe (john@example.com)</SelectItem>
                  <SelectItem value="user2">Jane Smith (jane@example.com)</SelectItem>
                  <SelectItem value="user3">Bob Johnson (bob@example.com)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="permission-select">Permission Level</Label>
              <Select defaultValue="READ">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="READ">Read Only</SelectItem>
                  <SelectItem value="WRITE">Read & Write</SelectItem>
                  <SelectItem value="ADMIN">Full Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
                Cancel
              </Button>
              <Button>Share</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}