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
import { encryptionManager, encryptPassword, generatePassword, isEncryptionReady, decryptPassword } from "@/lib/encryption";
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
  const [showPasswordSettings, setShowPasswordSettings] = useState(false);
  const [generatePasswordLength, setGeneratePasswordLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [excludeCustomChars, setExcludeCustomChars] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
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
            const strength = calculatePasswordStrength(passwordValue);
            setPasswordStrength(strength);
            
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
        setPasswordStrength(0);
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

  // Password strength calculation
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    
    let strength = 0;
    const length = password.length;
    
    // Length contributes up to 50 points
    strength += Math.min(length * 2, 50);
    
    // Character variety
    if (/[a-z]/.test(password)) strength += 10;
    if (/[A-Z]/.test(password)) strength += 10;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
    
    return Math.min(strength, 100);
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

  // Enhanced password generator with entropy calculation
  const generateSecurePassword = () => {
    const charset = [];
    if (includeLowercase) charset.push('abcdefghijklmnopqrstuvwxyz');
    if (includeUppercase) charset.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    if (includeNumbers) charset.push('0123456789');
    if (includeSymbols) charset.push('!@#$%^&*()_+-=[]{}|;:,.<>?');
    
    if (charset.length === 0) {
      setPasswordErrors(["Выберите хотя бы один тип символов"]);
      return;
    }
    
    let allChars = charset.join('');
    
    // Exclude ambiguous characters if enabled
    if (excludeAmbiguous) {
      const ambiguousChars = '0O1lI';
      allChars = allChars.split('').filter(char => !ambiguousChars.includes(char)).join('');
    }
    
    // Exclude custom characters if provided
    if (excludeCustomChars) {
      allChars = allChars.split('').filter(char => !excludeCustomChars.includes(char)).join('');
    }
    
    if (allChars.length === 0) {
      setPasswordErrors(["Нет доступных символов для генерации пароля. Проверьте настройки исключения."]);
      return;
    }
    
    let password = '';
    
    // Ensure at least one character from each selected charset
    for (const chars of charset) {
      let filteredChars = chars;
      
      // Apply exclusions to each charset
      if (excludeAmbiguous) {
        const ambiguousChars = '0O1lI';
        filteredChars = filteredChars.split('').filter(char => !ambiguousChars.includes(char)).join('');
      }
      
      if (excludeCustomChars) {
        filteredChars = filteredChars.split('').filter(char => !excludeCustomChars.includes(char)).join('');
      }
      
      if (filteredChars.length > 0) {
        password += filteredChars.charAt(Math.floor(Math.random() * filteredChars.length));
      }
    }
    
    // Fill remaining length with random characters
    for (let i = password.length; i < generatePasswordLength; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    // Update form data and calculate strength
    setFormData(prev => ({ ...prev, password }));
    
    // Calculate and update password strength
    const strength = calculatePasswordStrength(password);
    setPasswordStrength(strength);
    
    // Validate password and update errors
    const errors = validatePassword(password);
    setPasswordErrors(errors);
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

  const generatePassword = () => {
    const newPassword = generatePassword(generatePasswordLength);
    setFormData(prev => ({ ...prev, password: newPassword }));
    
    // Calculate and update password strength
    const strength = calculatePasswordStrength(newPassword);
    setPasswordStrength(strength);
    
    // Validate password and update errors
    const errors = validatePassword(newPassword);
    setPasswordErrors(errors);
  };

  const handleInputChange = async (field: string, value: string | boolean) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Update password strength when password changes
    if (field === 'password') {
      const strength = calculatePasswordStrength(value as string);
      setPasswordStrength(strength);
      
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
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 px-3"
                    onClick={generateSecurePassword}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Индикатор надежности пароля */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Надежность пароля</span>
                    <span className={passwordStrength >= 70 ? "text-green-600" : passwordStrength >= 40 ? "text-yellow-600" : "text-red-600"}>
                      {passwordStrength >= 70 ? "Высокая" : passwordStrength >= 40 ? "Средняя" : "Низкая"} ({passwordStrength}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength >= 70 ? "bg-green-500" : 
                        passwordStrength >= 40 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                </div>
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

              {/* Настройки генератора паролей (скрываются/показываются) */}
              {showPasswordSettings && (
                <div className="p-4 border rounded-lg space-y-4 bg-muted/50">
                  <div className="space-y-2">
                    <Label htmlFor="length">Длина пароля: {generatePasswordLength}</Label>
                    <input
                      id="length"
                      type="range"
                      min="8"
                      max="32"
                      value={generatePasswordLength}
                      onChange={(e) => setGeneratePasswordLength(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="uppercase"
                        checked={includeUppercase}
                        onCheckedChange={setIncludeUppercase}
                      />
                      <Label htmlFor="uppercase">Заглавные буквы (A-Z)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="lowercase"
                        checked={includeLowercase}
                        onCheckedChange={setIncludeLowercase}
                      />
                      <Label htmlFor="lowercase">Строчные буквы (a-z)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="numbers"
                        checked={includeNumbers}
                        onCheckedChange={setIncludeNumbers}
                      />
                      <Label htmlFor="numbers">Цифры (0-9)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="symbols"
                        checked={includeSymbols}
                        onCheckedChange={setIncludeSymbols}
                      />
                      <Label htmlFor="symbols">Символы (!@#$%^&*)</Label>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t">
                    <h4 className="text-sm font-medium">Исключения</h4>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="excludeAmbiguous"
                        checked={excludeAmbiguous}
                        onCheckedChange={setExcludeAmbiguous}
                      />
                      <Label htmlFor="excludeAmbiguous">Исключить неоднозначные символы (0, O, 1, l, I)</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="excludeCustomChars">Исключить символы:</Label>
                      <Input
                        id="excludeCustomChars"
                        placeholder="Введите символы для исключения"
                        value={excludeCustomChars}
                        onChange={(e) => setExcludeCustomChars(e.target.value)}
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Например: !@#$%^&* для исключения специальных символов
                      </p>
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
              variant={showPasswordSettings ? "default" : "outline"}
              onClick={() => setShowPasswordSettings(!showPasswordSettings)}
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