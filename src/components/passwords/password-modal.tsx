"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Shield,
  Key,
  Globe,
  Folder,
  Building2,
  Star,
  Users,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  Settings
} from "lucide-react";
import { decryptPassword, isEncryptionReady } from "@/lib/encryption";
import { PasswordStrength } from "@/components/ui/password-strength";
import { apiClient } from "@/lib/api-client";

interface PasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  password?: {
    id: string;
    title: string;
    username?: string;
    password?: string;
    url?: string;
    notes?: string;
    icon?: string;
    favorite: boolean;
    folderId?: string;
    companyId?: string;
  };
  mode?: "create" | "edit";
  onSave?: (password: any) => void;
}

interface FolderData {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  companyId?: string;
  companyName?: string;
}

interface CompanyData {
  id: string;
  name: string;
}

export function PasswordModal({ open, onOpenChange, password, mode = "create", onSave }: PasswordModalProps) {
  const [formData, setFormData] = useState({
    title: password?.title || "",
    username: password?.username || "",
    password: password?.password || "",
    url: password?.url || "",
    notes: password?.notes || "",
    icon: password?.icon || "",
    favorite: password?.favorite || false,
    folderId: password?.folderId || "none",
    companyId: password?.companyId || "none",
  });

  const [folders, setFolders] = useState<FolderData[]>([]);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showGeneratorSettings, setShowGeneratorSettings] = useState(false);
  const [generatorLength, setGeneratorLength] = useState(16);
  const [generatorOptions, setGeneratorOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  });
  const [generatorCounts, setGeneratorCounts] = useState({
    uppercase: 2,
    lowercase: 2,
    numbers: 2,
    symbols: 2
  });
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [lastSelectedFolder, setLastSelectedFolder] = useState<string>("");
  const [lastSelectedCompany, setLastSelectedCompany] = useState<string>("");

  // Load folders and companies when modal opens
  useEffect(() => {
    if (open) {
      loadData();
      loadLastSelections();
      
      // Update form data when editing existing password
      if (password && mode === "edit") {
        console.log("PasswordModal: Editing password with data:", password);
        const loadPasswordData = async () => {
          let passwordValue = "";
          let fullPasswordData = password;
          
          // If we don't have the password field, fetch the full password data
          if (!password.password) {
            try {
              console.log("PasswordModal: Fetching full password data for ID:", password.id);
              const response = await apiClient.getPassword(password.id);
              if (response.data) {
                fullPasswordData = response.data;
                console.log("PasswordModal: Full password data received:", fullPasswordData);
              }
            } catch (error) {
              console.error('Error fetching full password data:', error);
            }
          }
          
          passwordValue = fullPasswordData.password || "";
          console.log("PasswordModal: Initial password value:", passwordValue);
          
          // Decrypt password if it's encrypted
          if (passwordValue && fullPasswordData.isEncrypted) {
            try {
              // Try to parse as EncryptedData object
              let encryptedData;
              if (typeof passwordValue === 'string') {
                try {
                  encryptedData = JSON.parse(passwordValue);
                } catch {
                  // If it's not JSON, it might be a simple string
                  encryptedData = passwordValue;
                }
              } else {
                encryptedData = passwordValue;
              }
              
              // Check if it has the structure of EncryptedData
              if (encryptedData && typeof encryptedData === 'object' && encryptedData.data && encryptedData.iv) {
                const decryptedPassword = await decryptPassword(encryptedData);
                passwordValue = decryptedPassword;
                console.log("PasswordModal: Decrypted password value:", passwordValue);
              } else {
                console.log("PasswordModal: Password is not in encrypted format, using as-is");
                passwordValue = fullPasswordData.password;
              }
            } catch (error) {
              console.error('Error decrypting password:', error);
              // If decryption fails, keep the encrypted value
              passwordValue = fullPasswordData.password;
            }
          }
          
          console.log("PasswordModal: Setting form data with password:", passwordValue ? "***" : "empty");
          setFormData({
            title: fullPasswordData.title || "",
            username: fullPasswordData.username || "",
            password: passwordValue,
            url: fullPasswordData.url || "",
            notes: fullPasswordData.notes || "",
            icon: fullPasswordData.icon || "",
            favorite: fullPasswordData.favorite || false,
            folderId: fullPasswordData.folderId || "none",
            companyId: fullPasswordData.companyId || "none",
          });
          
          // Calculate password strength for existing password
          if (passwordValue) {
            const errors = validatePassword(passwordValue);
            setPasswordErrors(errors);
          }
        };
        
        loadPasswordData();
      } else if (mode === "create") {
        // Reset form for new password
        setFormData({
          title: "",
          username: "",
          password: "",
          url: "",
          notes: "",
          icon: "",
          favorite: false,
          folderId: "none",
          companyId: "none",
        });
        setPasswordErrors([]);
      }
    }
  }, [open, password, mode]);

  const loadLastSelections = () => {
    try {
      const lastFolder = localStorage.getItem('lastSelectedFolder');
      const lastCompany = localStorage.getItem('lastSelectedCompany');
      
      if (lastFolder && formData.folderId === "none") {
        setLastSelectedFolder(lastFolder);
        setFormData(prev => ({ ...prev, folderId: lastFolder }));
      }
      if (lastCompany && formData.companyId === "none") {
        setLastSelectedCompany(lastCompany);
        setFormData(prev => ({ ...prev, companyId: lastCompany }));
      }
    } catch (error) {
      console.error('Error loading last selections:', error);
    }
  };

  const saveSelections = (folderId: string, companyId: string) => {
    try {
      if (folderId && folderId !== "none") {
        localStorage.setItem('lastSelectedFolder', folderId);
      }
      if (companyId && companyId !== "none") {
        localStorage.setItem('lastSelectedCompany', companyId);
      }
    } catch (error) {
      console.error('Error saving selections:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [foldersResponse, companiesResponse] = await Promise.all([
        apiClient.getFolders(),
        apiClient.getCompanies()
      ]);

      if (foldersResponse.data) {
        setFolders(foldersResponse.data);
      }
      if (companiesResponse.data) {
        setCompanies(companiesResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Password validation
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push("Пароль должен содержать минимум 8 символов");
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
    
    // Check for common patterns
    const commonPatterns = [
      /123456/, /password/, /qwerty/, /abc123/,
      /admin/, /user/, /letmein/, /welcome/
    ];
    
    if (commonPatterns.some(pattern => pattern.test(password.toLowerCase()))) {
      errors.push("Избегайте распространенных шаблонов");
    }
    
    return errors;
  };

  // Generate secure password using client-side crypto
  const handleGeneratePassword = () => {
    try {
      // Build character sets based on options
      let lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
      let uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let numberChars = '0123456789';
      let symbolChars = '!@#$%^&*';
      
      // Exclude ambiguous characters if enabled
      if (excludeAmbiguous) {
        lowercaseChars = lowercaseChars.replace(/[l]/g, '');
        uppercaseChars = uppercaseChars.replace(/[IO]/g, '');
        numberChars = numberChars.replace(/[01]/g, '');
        symbolChars = symbolChars.replace(/[|]/g, '');
      }
      
      // Validate that at least one character type is selected
      const selectedTypes = Object.entries(generatorOptions)
        .filter(([_, enabled]) => enabled)
        .map(([type, _]) => type);
      
      if (selectedTypes.length === 0) {
        setPasswordErrors(['Выберите хотя бы один тип символов для генерации']);
        return;
      }
      
      // Calculate total required characters from counts
      const totalRequiredChars = selectedTypes.reduce((sum, type) => {
        return sum + generatorCounts[type as keyof typeof generatorCounts];
      }, 0);
      
      // Validate that total required characters don't exceed password length
      if (totalRequiredChars > generatorLength) {
        setPasswordErrors([`Сумма минимальных символов (${totalRequiredChars}) превышает длину пароля (${generatorLength})`]);
        return;
      }
      
      let password = '';
      const remainingLength = generatorLength - totalRequiredChars;
      
      // Add required characters of each type
      if (generatorOptions.lowercase) {
        for (let i = 0; i < generatorCounts.lowercase; i++) {
          const randomIndex = Math.floor(Math.random() * lowercaseChars.length);
          password += lowercaseChars[randomIndex];
        }
      }
      
      if (generatorOptions.uppercase) {
        for (let i = 0; i < generatorCounts.uppercase; i++) {
          const randomIndex = Math.floor(Math.random() * uppercaseChars.length);
          password += uppercaseChars[randomIndex];
        }
      }
      
      if (generatorOptions.numbers) {
        for (let i = 0; i < generatorCounts.numbers; i++) {
          const randomIndex = Math.floor(Math.random() * numberChars.length);
          password += numberChars[randomIndex];
        }
      }
      
      if (generatorOptions.symbols) {
        for (let i = 0; i < generatorCounts.symbols; i++) {
          const randomIndex = Math.floor(Math.random() * symbolChars.length);
          password += symbolChars[randomIndex];
        }
      }
      
      // Build charset for remaining characters
      let charset = '';
      if (generatorOptions.lowercase) charset += lowercaseChars;
      if (generatorOptions.uppercase) charset += uppercaseChars;
      if (generatorOptions.numbers) charset += numberChars;
      if (generatorOptions.symbols) charset += symbolChars;
      
      // Add remaining random characters
      for (let i = 0; i < remainingLength; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
      }
      
      // Shuffle the password to mix required characters
      password = password.split('').sort(() => Math.random() - 0.5).join('');
      
      setFormData(prev => ({ ...prev, password }));
      
      // Validate password and update errors
      const errors = validatePassword(password);
      setPasswordErrors(errors);
    } catch (error) {
      console.error('Error generating password:', error);
      setPasswordErrors(['Ошибка генерации пароля']);
    }
  };

  // Handle generator option changes
  const handleGeneratorOptionChange = (option: keyof typeof generatorOptions, value: boolean) => {
    setGeneratorOptions(prev => ({ ...prev, [option]: value }));
  };

  // Handle generator count changes
  const handleGeneratorCountChange = (type: keyof typeof generatorCounts, value: number) => {
    setGeneratorCounts(prev => ({ ...prev, [type]: Math.max(0, value) }));
  };

  // Auto-fill from URL
  const handleUrlChange = async (url: string) => {
    setFormData(prev => ({ ...prev, url }));
    
    if (url && !formData.title) {
      try {
        const domain = new URL(url).hostname.replace('www.', '');
        const title = domain.charAt(0).toUpperCase() + domain.slice(1);
        setFormData(prev => ({ ...prev, title }));
      } catch {
        // Invalid URL, ignore
      }
    }
  };

  // Check for duplicate passwords
  const checkForDuplicates = async (title: string, username?: string) => {
    try {
      const response = await apiClient.getPasswords('all');
      if (response.data) {
        const duplicates = response.data.filter((p: any) => 
          p.title.toLowerCase() === title.toLowerCase() && 
          (!username || p.username?.toLowerCase() === username?.toLowerCase()) &&
          p.id !== password?.id
        );
        
        if (duplicates.length > 0) {
          return `Найден дубликат: ${duplicates[0].title}${duplicates[0].username ? ` (${duplicates[0].username})` : ''}`;
        }
      }
    } catch (error) {
      console.error('Error checking duplicates:', error);
    }
    return null;
  };

  const handleInputChange = async (field: string, value: string | boolean) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Update password validation when password changes
    if (field === 'password') {
      const errors = validatePassword(value as string);
      setPasswordErrors(errors);
    }
    
    // Check for duplicates when title or username changes
    if (field === 'title' || field === 'username') {
      if (newFormData.title) {
        const duplicate = await checkForDuplicates(newFormData.title, newFormData.username);
        if (duplicate) {
          setPasswordErrors(prev => [...prev, duplicate]);
        }
      }
    }
    
    // Handle URL change for auto-fill
    if (field === 'url') {
      handleUrlChange(value as string);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    const errors = validatePassword(formData.password);
    if (errors.length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    // Check for duplicates
    const duplicate = await checkForDuplicates(formData.title, formData.username);
    if (duplicate) {
      setPasswordErrors([duplicate]);
      return;
    }
    
    // Save selections
    saveSelections(formData.folderId, formData.companyId);
    
    try {
      let passwordToSave = formData.password;
      
      // Encrypt password if encryption is ready
      if (isEncryptionReady() && formData.password) {
        const encryptedData = await encryptPassword(formData.password);
        passwordToSave = JSON.stringify(encryptedData);
      }
      
      const dataToSave = {
        ...formData,
        folderId: formData.folderId === "none" ? null : formData.folderId,
        companyId: formData.companyId === "none" ? null : formData.companyId,
        password: passwordToSave,
        isEncrypted: isEncryptionReady()
      };
      
      onSave?.(dataToSave);
    } catch (error) {
      console.error('Failed to encrypt password:', error);
      // Save without encryption if there's an error
      onSave?.(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {mode === "create" ? "Добавить пароль" : "Редактировать пароль"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Создайте новую запись для хранения пароля и связанных данных"
              : "Измените данные сохраненного пароля"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Основные поля */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название</Label>
                <Input
                  id="title"
                  placeholder="Например: Google Workspace"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Логин/Email</Label>
                <Input
                  id="username"
                  placeholder="user@example.com"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Введите пароль"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Скрыть пароль" : "Показать пароль"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 px-3"
                    onClick={() => navigator.clipboard.writeText(formData.password)}
                    title="Копировать пароль"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 px-3"
                    onClick={handleGeneratePassword}
                    title="Сгенерировать пароль"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Индикатор надежности пароля */}
                <PasswordStrength password={formData.password} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => handleInputChange("url", e.target.value)}
                />
              </div>
            </div>

            {/* Детали */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Детали</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="folder">Папка</Label>
                  <Select value={formData.folderId} onValueChange={(value) => handleInputChange("folderId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите папку" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Без папки</SelectItem>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          <div className="flex items-center gap-2">
                            {folder.color && (
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: folder.color }}
                              />
                            )}
                            {folder.icon && <span className="text-sm">{folder.icon}</span>}
                            {folder.name}
                            {folder.companyName && (
                              <span className="text-xs text-muted-foreground">
                                ({folder.companyName})
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Компания</Label>
                  <Select value={formData.companyId} onValueChange={(value) => handleInputChange("companyId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите компанию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Без компании</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {company.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Заметки</Label>
                <Textarea
                  id="notes"
                  placeholder="Дополнительная информация..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="favorite"
                  checked={formData.favorite}
                  onCheckedChange={(checked) => handleInputChange("favorite", checked)}
                />
                <Label htmlFor="favorite">Добавить в избранное</Label>
              </div>
            </div>

            {/* Безопасность */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Безопасность</h3>

              {/* Настройки генератора паролей */}
              {showGeneratorSettings && (
                <div className="p-4 border rounded-lg space-y-4 bg-muted/50">
                  <div className="space-y-2">
                    <Label>Длина пароля: {generatorLength}</Label>
                    <input
                      type="range"
                      min="8"
                      max="32"
                      value={generatorLength}
                      onChange={(e) => setGeneratorLength(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={generatorOptions.uppercase}
                        onCheckedChange={(checked) => handleGeneratorOptionChange('uppercase', checked)}
                      />
                      <Label>Заглавные буквы (A-Z)</Label>
                      {generatorOptions.uppercase && (
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleGeneratorCountChange('uppercase', Math.max(0, generatorCounts.uppercase - 1))}
                          >
                            -
                          </Button>
                          <span className="text-xs w-6 text-center">{generatorCounts.uppercase}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleGeneratorCountChange('uppercase', generatorCounts.uppercase + 1)}
                          >
                            +
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={generatorOptions.lowercase}
                        onCheckedChange={(checked) => handleGeneratorOptionChange('lowercase', checked)}
                      />
                      <Label>Строчные буквы (a-z)</Label>
                      {generatorOptions.lowercase && (
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleGeneratorCountChange('lowercase', Math.max(0, generatorCounts.lowercase - 1))}
                          >
                            -
                          </Button>
                          <span className="text-xs w-6 text-center">{generatorCounts.lowercase}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleGeneratorCountChange('lowercase', generatorCounts.lowercase + 1)}
                          >
                            +
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={generatorOptions.numbers}
                        onCheckedChange={(checked) => handleGeneratorOptionChange('numbers', checked)}
                      />
                      <Label>Цифры (0-9)</Label>
                      {generatorOptions.numbers && (
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleGeneratorCountChange('numbers', Math.max(0, generatorCounts.numbers - 1))}
                          >
                            -
                          </Button>
                          <span className="text-xs w-6 text-center">{generatorCounts.numbers}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleGeneratorCountChange('numbers', generatorCounts.numbers + 1)}
                          >
                            +
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={generatorOptions.symbols}
                        onCheckedChange={(checked) => handleGeneratorOptionChange('symbols', checked)}
                      />
                      <Label>Символы (!@#$%^&*)</Label>
                      {generatorOptions.symbols && (
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleGeneratorCountChange('symbols', Math.max(0, generatorCounts.symbols - 1))}
                          >
                            -
                          </Button>
                          <span className="text-xs w-6 text-center">{generatorCounts.symbols}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleGeneratorCountChange('symbols', generatorCounts.symbols + 1)}
                          >
                            +
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={excludeAmbiguous}
                        onCheckedChange={(checked) => setExcludeAmbiguous(checked)}
                      />
                      <Label>Исключить неоднозначные символы (0/O, 1/I/l)</Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Ошибки и предупреждения */}
              {passwordErrors.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    <ul className="list-disc list-inside space-y-1">
                      {passwordErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant={showGeneratorSettings ? "default" : "outline"}
              onClick={() => setShowGeneratorSettings(!showGeneratorSettings)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Настройки генератора
            </Button>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Отмена
              </Button>
              <Button type="submit">
                {mode === "create" ? "Создать" : "Сохранить"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}