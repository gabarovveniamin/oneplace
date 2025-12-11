import React, { useState, useEffect, useRef } from 'react';
import { Button } from "../../../shared/ui/components/button";
import { Card, CardContent } from "../../../shared/ui/components/card";
import { Input } from "../../../shared/ui/components/input";
import { Label } from "../../../shared/ui/components/label";
import { Textarea } from "../../../shared/ui/components/textarea";
import { Alert, AlertDescription } from "../../../shared/ui/components/alert";
import { Badge } from "../../../shared/ui/components/badge";
import {
  ArrowLeft,
  Camera,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  AlertCircle,
  CheckCircle,
  Save,
  Download,
  Plus,
  X,
  Lock,
  Edit2
} from "lucide-react";
import { authApiService } from '../../../core/api/auth';
import { FavoritesSection } from "./FavoritesSection";
import { Job } from "../../../shared/types/job";

interface ProfileProps {
  onBack: () => void;
  onAdminClick?: () => void;
  onJobClick: (job: Job) => void;
}

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
}

export function Profile({ onBack, onAdminClick, onJobClick }: ProfileProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });

  // Local state for additional info (not saved to backend yet)
  const [localData, setLocalData] = useState({
    position: '',
    bio: '',
    location: '',
    experience: '',
    skills: [] as string[]
  });

  const [newSkill, setNewSkill] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await authApiService.getProfile();
      setUser(profileData);
      setEditedData({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone || '+7 '
      });
      // Load from localStorage
      const savedLocal = localStorage.getItem(`profile_${profileData.id}`);
      if (savedLocal) {
        setLocalData(JSON.parse(savedLocal));
      }
    } catch (err: any) {
      setError(err?.message || 'Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing && user) {
      // Cancel - reset to original values
      setEditedData({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '+7 '
      });
    }
    setIsEditing(!isEditing);
    setSuccess(null);
    setError(null);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate required fields
      if (!editedData.firstName || !editedData.lastName) {
        setError('Имя и фамилия обязательны для заполнения');
        setSaving(false);
        return;
      }

      // Validate contact info if in editing mode
      if (!editedData.phone || !editedData.phone.trim()) {
        setError('Номер телефона обязателен для заполнения');
        setSaving(false);
        return;
      }

      if (!localData.location || !localData.location.trim()) {
        setError('Местоположение обязательно для заполнения');
        setSaving(false);
        return;
      }

      if (!localData.experience || !localData.experience.trim()) {
        setError('Опыт работы обязателен для заполнения');
        setSaving(false);
        return;
      }

      // Clean phone number - extract only digits
      const cleanedPhone = editedData.phone.replace(/\D/g, '');

      // Only send fields that backend accepts
      const updateData: any = {
        firstName: editedData.firstName.trim(),
        lastName: editedData.lastName.trim(),
        phone: cleanedPhone // Send only digits
      };

      console.log('Sending update data:', updateData);
      const updatedProfile = await authApiService.updateProfile(updateData);
      console.log('Updated profile:', updatedProfile);

      setUser(updatedProfile);
      setIsEditing(false);

      // Save local data to localStorage
      if (user) {
        localStorage.setItem(`profile_${user.id}`, JSON.stringify(localData));
      }

      setSuccess('✅ Профиль успешно сохранен!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err?.response?.data?.message || err?.message || 'Не удалось сохранить профиль');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Новые пароли не совпадают');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Новый пароль должен содержать минимум 6 символов');
      return;
    }

    try {
      await authApiService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      setSuccess('✅ Пароль успешно изменен!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordChange(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setPasswordError(err?.message || 'Не удалось изменить пароль');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB');
      return;
    }

    try {
      setError(null);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);

        try {
          const updatedProfile = await authApiService.updateProfile({
            avatar: base64String
          });
          setUser({ ...user!, ...updatedProfile });
          setSuccess('✅ Фото профиля успешно обновлено!');
          setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
          setError(err?.message || 'Не удалось загрузить фото');
          setAvatarPreview(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError('Ошибка при обработке файла');
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !localData.skills.includes(newSkill.trim())) {
      const updatedSkills = [...localData.skills, newSkill.trim()];
      setLocalData({ ...localData, skills: updatedSkills });
      setNewSkill('');
      // Auto-save local data
      if (user) {
        localStorage.setItem(`profile_${user.id}`, JSON.stringify({ ...localData, skills: updatedSkills }));
      }
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = localData.skills.filter((s: string) => s !== skillToRemove);
    setLocalData({ ...localData, skills: updatedSkills });
    // Auto-save local data
    if (user) {
      localStorage.setItem(`profile_${user.id}`, JSON.stringify({ ...localData, skills: updatedSkills }));
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');

    // Always start with +7
    if (cleaned.length === 0) return '+7 ';

    // Format: +7 (XXX) XXX-XX-XX
    let formatted = '+7 ';

    if (cleaned.length > 1) {
      const withoutCountryCode = cleaned.substring(1); // Remove the '7' from beginning

      // Add area code with parentheses
      if (withoutCountryCode.length > 0) {
        formatted += '(' + withoutCountryCode.substring(0, 3);
      }
      if (withoutCountryCode.length >= 3) {
        formatted += ') ' + withoutCountryCode.substring(3, 6);
      }
      if (withoutCountryCode.length >= 6) {
        formatted += '-' + withoutCountryCode.substring(6, 8);
      }
      if (withoutCountryCode.length >= 8) {
        formatted += '-' + withoutCountryCode.substring(8, 10);
      }
    }

    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // If user tries to delete +7, restore it
    if (value.length < 3) {
      setEditedData({ ...editedData, phone: '+7 ' });
      return;
    }

    // Format the phone number
    const formatted = formatPhoneNumber(value);
    setEditedData({ ...editedData, phone: formatted });
  };

  const handleLogout = () => {
    authApiService.logout();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-foreground text-lg">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Не удалось загрузить данные профиля</AlertDescription>
            </Alert>
            <Button onClick={onBack} className="mt-4 w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              На главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            На главную
          </Button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="px-4 sm:px-6 lg:px-8 mb-6">
            <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
            </Alert>
          </div>
        )}

        {error && (
          <div className="px-4 sm:px-6 lg:px-8 mb-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-card shadow-sm border-b">
          {/* Blue Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 h-40"></div>

          {/* Profile Info */}
          <div className="px-4 sm:px-6 lg:px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-20">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-40 h-40 rounded-full overflow-hidden bg-card border-8 border-card shadow-xl">
                  {avatarPreview || user.avatar ? (
                    <img
                      src={avatarPreview || user.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <svg className="w-20 h-20 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all"
                >
                  <Camera className="h-5 w-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              {/* Name and Position */}
              <div className="flex-1">
                <div className="pt-4">
                  {isEditing ? (
                    <div className="space-y-3 max-w-2xl">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <Label className="text-sm">Имя</Label>
                          <Input
                            value={editedData.firstName}
                            onChange={(e) => setEditedData({ ...editedData, firstName: e.target.value })}
                            placeholder="Имя"
                            className="text-xl font-bold h-12"
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-sm">Фамилия</Label>
                          <Input
                            value={editedData.lastName}
                            onChange={(e) => setEditedData({ ...editedData, lastName: e.target.value })}
                            placeholder="Фамилия"
                            className="text-xl font-bold h-12"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">Должность</Label>
                        <Input
                          value={localData.position}
                          onChange={(e) => setLocalData({ ...localData, position: e.target.value })}
                          placeholder="Frontend разработчик"
                          className="text-lg h-11"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold">
                        {user.firstName} {user.lastName}
                      </h1>
                      <p className="text-lg text-muted-foreground mt-1">
                        {localData.position || 'Должность не указана'}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                {!isEditing ? (
                  <>
                    <Button
                      onClick={handleEditToggle}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Редактировать
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowPasswordChange(!showPasswordChange)}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Пароль
                    </Button>
                    {user.role === 'admin' && onAdminClick && (
                      <Button
                        variant="destructive"
                        onClick={onAdminClick}
                        className="bg-red-600 hover:bg-red-700 text-white ml-2"
                      >
                        Админ
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleEditToggle}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Отмена
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        {showPasswordChange && (
          <div className="px-4 sm:px-6 lg:px-8 mt-6">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Изменить пароль</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPasswordChange(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  {passwordError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{passwordError}</AlertDescription>
                    </Alert>
                  )}
                  <div>
                    <Label>Текущий пароль</Label>
                    <Input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Новый пароль</Label>
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <Label>Подтвердите новый пароль</Label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Изменить пароль
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">
                    Контактная информация
                  </h2>

                  <div className="space-y-5">
                    {/* Email */}
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p className="text-sm break-all">{user.email}</p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Телефон</p>
                        {isEditing ? (
                          <Input
                            type="tel"
                            placeholder="+7 (___) ___-__-__ *"
                            value={editedData.phone}
                            onChange={handlePhoneChange}
                            className="h-9"
                            required
                          />
                        ) : (
                          <p className="text-sm">{user.phone || 'Не указан'}</p>
                        )}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Местоположение</p>
                        {isEditing ? (
                          <Input
                            placeholder="Москва, Россия *"
                            value={localData.location}
                            onChange={(e) => setLocalData({ ...localData, location: e.target.value })}
                            className="h-9"
                            required
                          />
                        ) : (
                          <p className="text-sm">{localData.location || 'Не указано'}</p>
                        )}
                      </div>
                    </div>

                    {/* Experience */}
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Опыт работы</p>
                        {isEditing ? (
                          <Input
                            placeholder="5 лет *"
                            value={localData.experience}
                            onChange={(e) => setLocalData({ ...localData, experience: e.target.value })}
                            className="h-9"
                            required
                          />
                        ) : (
                          <p className="text-sm">{localData.experience || 'Не указано'}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Download Resume Button */}
                  <Button
                    variant="outline"
                    className="w-full mt-6"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Скачать резюме
                  </Button>

                  {/* Logout Button */}
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full mt-3 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                  >
                    Выйти из аккаунта
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - About & Skills */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">О себе</h2>
                  {isEditing ? (
                    <Textarea
                      placeholder="Опытный frontend разработчик с 5-летним стажем. Специализируюсь на создании современных веб-приложений с использованием React и TypeScript..."
                      value={localData.bio}
                      onChange={(e) => setLocalData({ ...localData, bio: e.target.value })}
                      rows={6}
                      className="resize-none"
                    />
                  ) : (
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {localData.bio || 'Информация не указана'}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Skills Section */}
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Навыки</h2>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {localData.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 px-4 py-2 text-sm font-medium"
                      >
                        {skill}
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                    {localData.skills.length === 0 && (
                      <p className="text-muted-foreground text-sm">
                        {isEditing ? 'Добавьте свои навыки' : 'Навыки не указаны'}
                      </p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="React, TypeScript, Node.js..."
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                      />
                      <Button
                        onClick={handleAddSkill}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          <FavoritesSection onJobClick={onJobClick} />
        </div>
      </div>
    </div>
  );
}