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
  Plus,
  X,
  Lock,
  Edit2,
  Building,
  User as UserIcon,
  ClipboardList,
  Heart,
  MessageSquare
} from "lucide-react";
import { authApiService } from '../../../core/api/auth';
import { ApiError } from '../../../core/api';
import { FavoritesSection } from "./FavoritesSection";
import { ApplicationsSection } from "./ApplicationsSection";
import { EmployerApplicationsSection } from "./EmployerApplicationsSection";
import { Job } from "../../../shared/types/job";
import { cn } from "../../../shared/ui/components/utils";

import { resumeApiService } from '../../../core/api/resume';
import { ChatWindow } from "../../chat/components/ChatWindow";
import { Chat } from '../../../core/api/chat';

interface ProfileProps {
  onBack: () => void;
  onAdminClick?: () => void;
  onJobClick: (job: Job) => void;
  onCreateResume?: () => void;
  onShowResume?: () => void;
  userId?: string;
  onChatOpen?: (chat: Chat) => void;
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

export function Profile({ onBack, onAdminClick, onJobClick, onCreateResume, onShowResume, userId, onChatOpen }: ProfileProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasResume, setHasResume] = useState(false);

  // Determine if we are viewing our own profile
  // If userId is undefined, we assume it's the current user (own profile)
  // But we need to verify against the actual logged-in user ID to be sure
  const currentUser = authApiService.getCurrentUser();
  const isOwnProfile = !userId || (currentUser && currentUser.id === userId);

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });

  // Local state for additional info
  const [localData, setLocalData] = useState({
    position: '',
    bio: '',
    location: '',
    experience: '',
    skills: [] as string[]
  });

  const [orgData, setOrgData] = useState({
    name: '',
    industry: '',
    location: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    logo: ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'info' | 'applications' | 'favorites'>('info');

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // Fetch the specific user's profile
      const profileData = await authApiService.getProfile(userId);
      setUser(profileData);
      setEditedData({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone || '+7 '
      });
      if (profileData.role === 'employer') {
        setOrgData({
          name: profileData.orgName || '',
          industry: profileData.orgIndustry || '',
          location: profileData.orgLocation || '',
          description: profileData.orgDescription || '',
          website: profileData.orgWebsite || '',
          email: profileData.orgEmail || '',
          phone: profileData.orgPhone || '',
          logo: profileData.orgLogo || ''
        });
      }

      // Handle extra data (Bio, Skills, etc.) via Resume or LocalStorage
      if (isOwnProfile) {
        // Own profile: Load from localStorage
        const savedLocal = localStorage.getItem(`profile_${profileData.id}`);
        if (savedLocal) {
          setLocalData(JSON.parse(savedLocal));
        }
      }

      // Always try to fetch resume to check existence and/or populate data
      // Check for resume (allow for all roles to view, but only 'user' typically has one)
      if (profileData.role === 'user') {
        try {
          const resume = await resumeApiService.getResume(userId);
          if (resume) {
            setHasResume(true);
            // If viewing someone else, populate the "Profile" view with data from their Resume
            if (!isOwnProfile) {
              setLocalData({
                position: resume.title,
                bio: resume.summary,
                location: resume.city,
                experience: resume.experience?.[0]?.company || '', // Simplified for profile view
                skills: resume.skills || []
              });
            }
          } else {
            setHasResume(false);
          }
        } catch (e) {
          console.warn('Failed to load resume or no resume exists', e);
          setHasResume(false);
        }
      }

    } catch (err: any) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Не удалось загрузить профиль');
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
    setFieldErrors({}); // Clear field errors on toggle
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      setFieldErrors({});

      let hasErrors = false;
      const newFieldErrors: Record<string, string> = {};

      // Validate required fields
      if (!editedData.firstName?.trim()) {
        newFieldErrors.firstName = 'Имя обязательно для заполнения';
        hasErrors = true;
      }
      if (!editedData.lastName?.trim()) {
        newFieldErrors.lastName = 'Фамилия обязательна для заполнения';
        hasErrors = true;
      }

      // Validate contact info
      if (!editedData.phone || !editedData.phone.trim()) {
        newFieldErrors.phone = 'Номер телефона обязателен';
        hasErrors = true;
      } else {
        const cleaned = editedData.phone.replace(/\D/g, '');
        if (cleaned.length > 0 && cleaned.length < 11) {
          newFieldErrors.phone = `Доработайте номер: не хватает ${11 - cleaned.length} цифр`;
          hasErrors = true;
        }
      }

      if (user?.role === 'user') {
        if (!localData.location?.trim()) {
          newFieldErrors.location = 'Местоположение обязательно';
          hasErrors = true;
        }
        if (!localData.experience?.trim()) {
          newFieldErrors.experience = 'Опыт работы обязателен';
          hasErrors = true;
        }
      }

      if (user?.role === 'employer') {
        if (!orgData.name?.trim()) {
          newFieldErrors.orgName = 'Название компании обязательно';
          hasErrors = true;
        }

        if (orgData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orgData.email)) {
          newFieldErrors.orgEmail = 'Некорректный формат Email';
          hasErrors = true;
        }

        if (orgData.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(orgData.website)) {
          newFieldErrors.orgWebsite = 'Некорректный формат сайта (нужно: https://example.com)';
          hasErrors = true;
        }

        if (orgData.phone) {
          const cleaned = orgData.phone.replace(/\D/g, '');
          if (cleaned.length > 0 && cleaned.length < 11) {
            newFieldErrors.orgPhone = `Доработайте номер: не хватает ${11 - cleaned.length} цифр`;
            hasErrors = true;
          }
        }
      }

      if (hasErrors) {
        setFieldErrors(newFieldErrors);
        setError('Пожалуйста, доработайте поля, отмеченные красным');
        setSaving(false);
        return;
      }

      const cleanedPhone = editedData.phone.replace(/\D/g, '');
      const updateData: any = {
        firstName: editedData.firstName.trim(),
        lastName: editedData.lastName.trim(),
        phone: cleanedPhone
      };

      if (user?.role === 'employer') {
        updateData.orgName = orgData.name;
        updateData.orgIndustry = orgData.industry;
        updateData.orgLocation = orgData.location;
        updateData.orgDescription = orgData.description;
        updateData.orgWebsite = orgData.website;
        updateData.orgEmail = orgData.email;
        updateData.orgPhone = orgData.phone.replace(/\D/g, ''); // Clean org phone
        updateData.orgLogo = orgData.logo;
      }

      console.log('Sending update data:', updateData);
      const updatedProfile = await authApiService.updateProfile(updateData);

      setUser(updatedProfile);

      // Update local orgData with fresh data from server
      setOrgData({
        name: updatedProfile.orgName || '',
        industry: updatedProfile.orgIndustry || '',
        location: updatedProfile.orgLocation || '',
        description: updatedProfile.orgDescription || '',
        website: updatedProfile.orgWebsite || '',
        email: updatedProfile.orgEmail || '',
        phone: updatedProfile.orgPhone || '',
        logo: updatedProfile.orgLogo || ''
      });

      setIsEditing(false);

      // Save extra local data (position, bio, etc) to localStorage
      if (user) {
        localStorage.setItem(`profile_${user.id}`, JSON.stringify(localData));
      }

      setSuccess('✅ Профиль успешно сохранен!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Не удалось сохранить профиль');
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
    let cleaned = value.replace(/\D/g, '');

    if (cleaned === '') return '';

    // If it starts with 8, change to 7
    if (cleaned.startsWith('8')) {
      cleaned = '7' + cleaned.substring(1);
    }

    // If it doesn't start with 7, assume it's the number without country code
    if (!cleaned.startsWith('7') && cleaned.length > 0) {
      cleaned = '7' + cleaned;
    }

    // Limit to 11 digits (7 + 10 digits)
    cleaned = cleaned.substring(0, 11);

    // Format: +7 (XXX) XXX-XX-XX
    let formatted = '+7';

    if (cleaned.length > 1) {
      formatted += ' (' + cleaned.substring(1, 4);
    }
    if (cleaned.length > 4) {
      formatted += ') ' + cleaned.substring(4, 7);
    }
    if (cleaned.length > 7) {
      formatted += '-' + cleaned.substring(7, 9);
    }
    if (cleaned.length > 9) {
      formatted += '-' + cleaned.substring(9, 11);
    }

    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value.length > 0 && !value.startsWith('+')) {
      value = '+' + value;
    }
    const formatted = formatPhoneNumber(value);
    setEditedData({ ...editedData, phone: formatted });
  };

  const handleOrgPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value.length > 0 && !value.startsWith('+')) {
      value = '+' + value;
    }
    const formatted = formatPhoneNumber(value);
    setOrgData({ ...orgData, phone: formatted });
  };

  const onPhoneFocus = (field: 'user' | 'org') => {
    if (field === 'user' && (!editedData.phone || editedData.phone.trim() === '')) {
      setEditedData({ ...editedData, phone: '+7' });
    } else if (field === 'org' && (!orgData.phone || orgData.phone.trim() === '')) {
      setOrgData({ ...orgData, phone: '+7' });
    }
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
                {isOwnProfile && (
                  <>
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
                  </>
                )}
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
                            className={`text-xl font-bold h-12 ${fieldErrors.firstName ? 'border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]' : ''}`}
                          />
                          {fieldErrors.firstName && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.firstName}</p>}
                        </div>
                        <div className="flex-1">
                          <Label className="text-sm">Фамилия</Label>
                          <Input
                            value={editedData.lastName}
                            onChange={(e) => setEditedData({ ...editedData, lastName: e.target.value })}
                            placeholder="Фамилия"
                            className={`text-xl font-bold h-12 ${fieldErrors.lastName ? 'border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]' : ''}`}
                          />
                          {fieldErrors.lastName && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.lastName}</p>}
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
                    {/* Only show Message button if NOT own profile */}
                    {!isOwnProfile && (
                      <Button
                        onClick={() => {
                          if (user && onChatOpen) {
                            onChatOpen({
                              other_user_id: user.id,
                              first_name: user.firstName,
                              last_name: user.lastName,
                              avatar: user.avatar || null,
                              last_message: '',
                              last_message_at: new Date().toISOString(),
                              is_read: 1,
                              sender_id: '',
                              unread_count: 0
                            });
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Написать
                      </Button>
                    )}

                    {isOwnProfile && (
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
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg 
                                   shadow-[0_4px_0_0_#15803d] hover:shadow-[0_2px_0_0_#15803d] 
                                   active:shadow-none active:translate-y-[4px] 
                                   transition-all duration-75 flex items-center gap-2 border-b-4 border-green-800"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Section - Only Owner */}
        {showPasswordChange && isOwnProfile && (
          <div className="px-4 sm:px-6 lg:px-8 mt-6">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Изменить пароль</h3>
                  <button
                    onClick={() => setShowPasswordChange(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
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

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 lg:px-8 mt-8">
          <div className="flex overflow-x-auto border-b scrollbar-hide">
            <button
              onClick={() => setActiveSection('info')}
              className={cn(
                "flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap",
                activeSection === 'info'
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
              )}
            >
              <UserIcon className="h-4 w-4" />
              Профиль
            </button>

            {isOwnProfile && (
              <>
                <button
                  onClick={() => setActiveSection('applications')}
                  className={cn(
                    "flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap",
                    activeSection === 'applications'
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                  )}
                >
                  <ClipboardList className="h-4 w-4" />
                  {user.role === 'employer' ? 'Отклики на вакансии' : 'Мои отклики'}
                </button>

                <button
                  onClick={() => setActiveSection('favorites')}
                  className={cn(
                    "flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap",
                    activeSection === 'favorites'
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                  )}
                >
                  <Heart className="h-4 w-4" />
                  Избранное
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeSection === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Contact Details */}
              <div className="space-y-6">
                <Card className="shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Контактная информация</h2>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center text-blue-600">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider font-semibold opacity-50">Email</p>
                          <p className="font-medium">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/10 flex items-center justify-center text-green-600">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider font-semibold opacity-50">Телефон</p>
                          {isEditing ? (
                            <div className="space-y-1">
                              <Input
                                type="tel"
                                value={editedData.phone}
                                onChange={handlePhoneChange}
                                onFocus={() => onPhoneFocus('user')}
                                placeholder="+7 (999) 000-00-00"
                                className={fieldErrors.phone ? 'border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]' : ''}
                              />
                              {fieldErrors.phone && <p className="text-red-500 text-xs font-medium">{fieldErrors.phone}</p>}
                            </div>
                          ) : (
                            <p className="font-medium text-foreground">{user.phone || 'Не указан'}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/10 flex items-center justify-center text-orange-600">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider font-semibold opacity-50">Локация</p>
                          {isEditing ? (
                            <div className="space-y-1">
                              <Input
                                value={localData.location}
                                onChange={(e) => setLocalData({ ...localData, location: e.target.value })}
                                placeholder="Город"
                                className={`h-8 mt-1 ${fieldErrors.location ? 'border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]' : ''}`}
                              />
                              {fieldErrors.location && <p className="text-red-500 text-xs font-medium">{fieldErrors.location}</p>}
                            </div>
                          ) : (
                            <p className="font-medium text-foreground">{localData.location || 'Не указана'}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 space-y-3">
                      {user.role === 'user' && !userId && (
                        <>
                          {!hasResume ? (
                            <Button
                              onClick={onCreateResume}
                              className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Создать резюме
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={onShowResume}
                              className="w-full"
                            >
                              <Briefcase className="h-4 w-4 mr-2" />
                              Посмотреть резюме
                            </Button>
                          )}
                        </>
                      )}

                      {isOwnProfile && (
                        <Button
                          variant="outline"
                          onClick={handleLogout}
                          className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                        >
                          Выйти из аккаунта
                        </Button>
                      )}
                    </div>
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
                        placeholder="Расскажите о себе, своих интересах или опыте работы..."
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

                {/* Experience Section for Job Seeker */}
                {user.role === 'user' && (
                  <Card className="shadow-sm">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold mb-4">Опыт работы</h2>
                      {isEditing ? (
                        <div className="space-y-1">
                          <Input
                            placeholder="5 лет *"
                            value={localData.experience}
                            onChange={(e) => setLocalData({ ...localData, experience: e.target.value })}
                            className={`h-9 ${fieldErrors.experience ? 'border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]' : ''}`}
                            required
                          />
                          {fieldErrors.experience && <p className="text-red-500 text-xs font-medium">{fieldErrors.experience}</p>}
                        </div>
                      ) : (
                        <p className="text-sm font-medium">{localData.experience || 'Не указан'}</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Skills Section */}
                <Card className="shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Навыки</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {localData.skills.length > 0 ? (
                        localData.skills.map((skill: string, index: number) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-200 px-4 py-2 text-sm font-medium"
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
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          {isEditing ? 'Добавьте свои навыки' : 'Навыки не указаны'}
                        </p>
                      )}
                    </div>

                    {isEditing && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Добавить навык (напр. React, Python)"
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

              {/* Organization Section (Employer Only) */}
              {user.role === 'employer' && (
                <div className="lg:col-span-3">
                  <Card className="shadow-sm border-2 border-blue-100 dark:border-blue-900/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <Building className="h-6 w-6 text-blue-600" />
                          <h2 className="text-xl font-bold">Организация</h2>
                        </div>
                        {!isEditing && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            {orgData.name ? 'Зарегистрирована' : 'Не зарегистрирована'}
                          </Badge>
                        )}
                      </div>

                      {isEditing ? (
                        <>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <Label>Название компании *</Label>
                                <Input
                                  value={orgData.name}
                                  onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                                  placeholder="ООО 'Вектор'"
                                  className={fieldErrors.orgName ? 'border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]' : ''}
                                />
                                {fieldErrors.orgName && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.orgName}</p>}
                              </div>
                              <div>
                                <Label>Отрасль</Label>
                                <Input
                                  value={orgData.industry}
                                  onChange={(e) => setOrgData({ ...orgData, industry: e.target.value })}
                                  placeholder="IT, Строительство, Образование..."
                                />
                              </div>
                              <div>
                                <Label>Расположение компании</Label>
                                <Input
                                  value={orgData.location}
                                  onChange={(e) => setOrgData({ ...orgData, location: e.target.value })}
                                  placeholder="Москва, Пресненская наб., 12"
                                />
                              </div>
                              <div>
                                <Label>Сайт</Label>
                                <Input
                                  value={orgData.website}
                                  onChange={(e) => setOrgData({ ...orgData, website: e.target.value })}
                                  placeholder="https://company.com"
                                  className={fieldErrors.orgWebsite ? 'border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]' : ''}
                                />
                                {fieldErrors.orgWebsite && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.orgWebsite}</p>}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <Label>Email для вакансий</Label>
                                <Input
                                  value={orgData.email}
                                  onChange={(e) => setOrgData({ ...orgData, email: e.target.value })}
                                  placeholder="hr@company.com"
                                  className={fieldErrors.orgEmail ? 'border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]' : ''}
                                />
                                {fieldErrors.orgEmail && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.orgEmail}</p>}
                              </div>
                              <div>
                                <Label>Контактный телефон компании</Label>
                                <Input
                                  value={orgData.phone}
                                  onChange={handleOrgPhoneChange}
                                  onFocus={() => onPhoneFocus('org')}
                                  placeholder="+7 (999) 000-00-00"
                                  className={fieldErrors.orgPhone ? 'border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]' : ''}
                                />
                                {fieldErrors.orgPhone && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.orgPhone}</p>}
                              </div>
                              <div>
                                <Label>Описание компании</Label>
                                <Textarea
                                  value={orgData.description}
                                  onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
                                  placeholder="Расскажите о вашей компании, культуре и ценностях..."
                                  rows={4}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="mt-8 flex justify-end">
                            <Button
                              onClick={handleSaveProfile}
                              disabled={saving}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl 
                                         shadow-[0_6px_0_0_#1d4ed8] hover:shadow-[0_2px_0_0_#1d4ed8] 
                                         active:shadow-none active:translate-y-[6px] 
                                         transition-all duration-75 flex items-center gap-3 text-lg border-b-4 border-blue-800"
                            >
                              <Save className="h-6 w-6" />
                              {saving ? 'Сохранение...' : 'Сохранить данные организации'}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-6">
                          {orgData.name ? (
                            <div className="grid md:grid-cols-2 gap-8">
                              <div>
                                <div className="mb-4">
                                  <h3 className="font-bold text-lg">{orgData.name}</h3>
                                  <p className="text-blue-600 font-medium">{orgData.industry || 'Отрасль не указана'}</p>
                                </div>
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{orgData.location || 'Адрес не указан'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{orgData.email || 'Email не указан'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{orgData.phone || 'Телефон не указан'}</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground leading-relaxed italic">
                                  {orgData.description || 'Описание не добавлено'}
                                </p>
                                {orgData.website && (
                                  <a
                                    href={orgData.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-4 text-sm text-blue-600 hover:underline"
                                  >
                                    Перейти на сайт компании
                                  </a>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 bg-muted/30 rounded-lg border-2 border-dashed border-gray-200">
                              <p className="text-muted-foreground mb-4">Данные организации еще не заполнены</p>
                              <Button
                                variant="outline"
                                onClick={handleEditToggle}
                                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Зарегистрировать организацию
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {activeSection === 'applications' && isOwnProfile && (
            <div className="space-y-6">
              {user.role === 'employer' || user.role === 'admin' ? (
                <EmployerApplicationsSection className="mt-0" />
              ) : (
                <ApplicationsSection onJobClick={onJobClick} />
              )}
            </div>
          )}

          {activeSection === 'favorites' && isOwnProfile && (
            <FavoritesSection onJobClick={onJobClick} />
          )}
        </div>
      </div>
    </div>
  );
}
