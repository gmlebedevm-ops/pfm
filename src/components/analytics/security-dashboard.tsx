"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  Eye,
  Key,
  Users,
  Folder,
  Building2
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface PasswordHealth {
  total: number;
  strong: number;
  medium: number;
  weak: number;
  expired: number;
  reused: number;
}

interface SecurityStats {
  totalPasswords: number;
  totalFolders: number;
  totalCompanies: number;
  lastScan: string;
  securityScore: number;
}

interface RecentActivity {
  id: string;
  type: 'password_created' | 'password_updated' | 'password_accessed' | 'folder_created' | 'company_created';
  title: string;
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export function SecurityDashboard() {
  const [passwordHealth, setPasswordHealth] = useState<PasswordHealth>({
    total: 0,
    strong: 0,
    medium: 0,
    weak: 0,
    expired: 0,
    reused: 0
  });

  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    totalPasswords: 0,
    totalFolders: 0,
    totalCompanies: 0,
    lastScan: '',
    securityScore: 0
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load passwords data
      const passwordsResponse = await apiClient.getPasswords('all');
      const foldersResponse = await apiClient.getFolders();
      const companiesResponse = await apiClient.getCompanies();

      if (passwordsResponse.data) {
        const passwords = passwordsResponse.data;
        
        // Analyze password health (demo analysis)
        const health: PasswordHealth = {
          total: passwords.length,
          strong: Math.floor(passwords.length * 0.6),
          medium: Math.floor(passwords.length * 0.25),
          weak: Math.floor(passwords.length * 0.1),
          expired: Math.floor(passwords.length * 0.05),
          reused: Math.floor(passwords.length * 0.15)
        };
        
        setPasswordHealth(health);

        // Calculate security score
        const securityScore = Math.round((health.strong / health.total) * 100);
        
        setSecurityStats({
          totalPasswords: passwords.length,
          totalFolders: foldersResponse.data?.length || 0,
          totalCompanies: companiesResponse.data?.length || 0,
          lastScan: new Date().toISOString(),
          securityScore
        });
      }

      // Generate recent activity (demo data)
      const activity: RecentActivity[] = [
        {
          id: '1',
          type: 'password_created',
          title: 'Создан новый пароль',
          description: 'Google Workspace',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          severity: 'low'
        },
        {
          id: '2',
          type: 'password_updated',
          title: 'Пароль обновлен',
          description: 'GitHub - усиление безопасности',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          severity: 'medium'
        },
        {
          id: '3',
          type: 'password_accessed',
          title: 'Доступ к паролю',
          description: 'Банковский аккаунт',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          severity: 'low'
        },
        {
          id: '4',
          type: 'folder_created',
          title: 'Создана папка',
          description: 'Рабочие проекты',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          severity: 'low'
        },
        {
          id: '5',
          type: 'weak_password',
          title: 'Обнаружен слабый пароль',
          description: 'Старый пароль требует обновления',
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          severity: 'high'
        }
      ];

      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'password_created': return <Key className="h-4 w-4" />;
      case 'password_updated': return <Shield className="h-4 w-4" />;
      case 'password_accessed': return <Eye className="h-4 w-4" />;
      case 'folder_created': return <Folder className="h-4 w-4" />;
      case 'company_created': return <Building2 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Аналитика безопасности</h1>
          <p className="text-muted-foreground">
            Обзор состояния безопасности и здоровья паролей
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          Обновить данные
        </Button>
      </div>

      {/* Основные показатели */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общий рейтинг безопасности</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSecurityScoreColor(securityStats.securityScore)}`}>
              {securityStats.securityScore}%
            </div>
            <p className="text-xs text-muted-foreground">
              Последняя проверка: {new Date(securityStats.lastScan).toLocaleDateString('ru-RU')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего паролей</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.totalPasswords}</div>
            <p className="text-xs text-muted-foreground">
              {passwordHealth.strong} надежных паролей
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Папки</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.totalFolders}</div>
            <p className="text-xs text-muted-foreground">
              Организовано хранилище
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Предприятия</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">
              Организаций
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Здоровье паролей */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Анализ здоровья паролей
          </CardTitle>
          <CardDescription>
            Распределение паролей по уровню безопасности
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Надежные пароли</span>
                </div>
                <span className="text-sm font-medium">{passwordHealth.strong}</span>
              </div>
              <Progress 
                value={(passwordHealth.strong / passwordHealth.total) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {Math.round((passwordHealth.strong / passwordHealth.total) * 100)}% от общего числа
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Пароли средней надежности</span>
                </div>
                <span className="text-sm font-medium">{passwordHealth.medium}</span>
              </div>
              <Progress 
                value={(passwordHealth.medium / passwordHealth.total) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {Math.round((passwordHealth.medium / passwordHealth.total) * 100)}% от общего числа
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Слабые пароли</span>
                </div>
                <span className="text-sm font-medium">{passwordHealth.weak}</span>
              </div>
              <Progress 
                value={(passwordHealth.weak / passwordHealth.total) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {Math.round((passwordHealth.weak / passwordHealth.total) * 100)}% от общего числа
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Просроченные пароли</span>
                </div>
                <span className="text-sm font-medium">{passwordHealth.expired}</span>
              </div>
              <Progress 
                value={(passwordHealth.expired / passwordHealth.total) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {Math.round((passwordHealth.expired / passwordHealth.total) * 100)}% от общего числа
              </p>
            </div>
          </div>

          {/* Предупреждения */}
          {(passwordHealth.weak > 0 || passwordHealth.expired > 0) && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Обнаружены проблемы безопасности: {passwordHealth.weak} слабых паролей и {passwordHealth.expired} просроченных. 
                Рекомендуется обновить их для повышения безопасности.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Последняя активность */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Последняя активность
          </CardTitle>
          <CardDescription>
            Недавние действия в системе безопасности
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg border">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">{activity.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getSeverityColor(activity.severity)}`}
                    >
                      {activity.severity === 'high' ? 'Высокий' : 
                       activity.severity === 'medium' ? 'Средний' : 'Низкий'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString('ru-RU')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}