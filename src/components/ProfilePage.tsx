import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { User, Phone, Calendar, Edit, Camera, Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getMe, updateMe, uploadAvatar, resolveAssetUrl } from "../lib/api";
import type { AppUser } from "../types/user";

interface ProfilePageProps {
  user: AppUser;
  onUserUpdate?: (user: Partial<AppUser>) => void;
}

type PreferenceField = "language" | "timezone" | "date_format";
type PreferenceValues = Record<PreferenceField, string>;
type ProfileFormState = PreferenceValues & {
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  location: string;
  bio: string;
  avatar_url: string;
};

export function ProfilePage({ user, onUserUpdate }: ProfilePageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormState>({
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    company: user.company ?? "",
    role: user.job_title ?? "",
    location: user.location ?? "",
    timezone: user.timezone ?? "UTC",
    bio: user.bio ?? "",
    avatar_url: user.avatar_url ?? "",
    language: user.language ?? "en-US",
    date_format: user.date_format ?? "MM/DD/YYYY",
  });

  const [activePreference, setActivePreference] = useState<PreferenceField | null>(null);
  const [preferenceDraft, setPreferenceDraft] = useState<PreferenceValues>({
    language: user.language ?? "en-US",
    timezone: user.timezone ?? "UTC",
    date_format: user.date_format ?? "MM/DD/YYYY",
  });
  const [isPreferenceSaving, setIsPreferenceSaving] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: user.name ?? prev.name,
      email: user.email ?? prev.email,
      phone: user.phone ?? prev.phone,
      company: user.company ?? prev.company,
      role: user.job_title ?? prev.role,
      location: user.location ?? prev.location,
      bio: user.bio ?? prev.bio,
      timezone: user.timezone ?? prev.timezone,
      language: user.language ?? prev.language,
      date_format: user.date_format ?? prev.date_format,
      avatar_url: user.avatar_url ?? prev.avatar_url,
    }));
  }, [user]);

  useEffect(() => {
    setPreferenceDraft({
      language: formData.language,
      timezone: formData.timezone,
      date_format: formData.date_format,
    });
  }, [formData.language, formData.timezone, formData.date_format]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await getMe();
        if (!mounted || !me) return;
        setFormData((prev) => ({
          ...prev,
          name: me.name ?? prev.name,
          email: me.email ?? prev.email,
          phone: me.phone ?? prev.phone,
          timezone: me.timezone ?? prev.timezone,
          bio: me.bio ?? prev.bio,
          company: me.company ?? prev.company,
          role: me.job_title ?? me.role ?? prev.role,
          location: me.location ?? prev.location,
          avatar_url: me.avatar_url ?? "",
          language: me.language ?? prev.language,
          date_format: me.date_format ?? prev.date_format,
        }));
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const resolveAvatarUrl = () => {
    const asset = resolveAssetUrl(formData.avatar_url);
    if (asset) return asset;
    const seed = encodeURIComponent(formData.name || formData.email);
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`;
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const updated = await uploadAvatar(file);
      const newAvatar = updated?.avatar_url ?? "";
      setFormData((prev) => ({
        ...prev,
        avatar_url: newAvatar,
      }));
      toast.success("Profile photo updated");
      onUserUpdate?.({ avatar_url: newAvatar });
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload photo");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: Record<string, string> = {
        name: formData.name,
        phone: formData.phone,
        timezone: formData.timezone,
        language: formData.language,
        date_format: formData.date_format,
        company: formData.company,
        job_title: formData.role,
        location: formData.location,
        bio: formData.bio,
      };
      await updateMe(payload);
      toast.success("Profile updated successfully");
      setIsEditing(false);
      onUserUpdate?.({
        name: formData.name,
        phone: formData.phone,
        avatar_url: formData.avatar_url,
        company: formData.company,
        job_title: formData.role,
        location: formData.location,
        bio: formData.bio,
        timezone: formData.timezone,
        language: formData.language,
        date_format: formData.date_format,
      });
    } catch (error: any) {
      toast.error(error?.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const startPreferenceEdit = (field: PreferenceField) => {
    setPreferenceDraft((prev) => ({
      ...prev,
      [field]: formData[field],
    }));
    setActivePreference(field);
  };

  const handlePreferenceValueChange = (field: PreferenceField, value: string) => {
    setPreferenceDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handlePreferenceSave = async (field: PreferenceField) => {
    const value = preferenceDraft[field];
    if (!value) return;
    setIsPreferenceSaving(true);
    try {
      await updateMe({ [field]: value });
      setFormData((prev) => ({ ...prev, [field]: value }));
      setActivePreference(null);
      toast.success(`${field.replace("_", " ")} updated`);
      onUserUpdate?.({ [field]: value } as Partial<AppUser>);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update preference");
    } finally {
      setIsPreferenceSaving(false);
    }
  };

  const languageOptions = [
    { value: "en-US", label: "English (US)" },
    { value: "en-GB", label: "English (UK)" },
    { value: "es-ES", label: "Spanish" },
    { value: "fr-FR", label: "French" },
    { value: "de-DE", label: "German" },
    { value: "zh-CN", label: "Chinese (Simplified)" },
    { value: "ja-JP", label: "Japanese" },
  ];

  const timezoneOptions = [
    "UTC",
    "America/Los_Angeles",
    "America/New_York",
    "Europe/London",
    "Europe/Berlin",
    "Asia/Karachi",
    "Asia/Tokyo",
    "Asia/Shanghai",
  ];

  const dateFormatOptions = [
    "MM/DD/YYYY",
    "DD/MM/YYYY",
    "YYYY-MM-DD",
  ];

  const getLanguageLabel = (value: string) =>
    languageOptions.find((option) => option.value === value)?.label || value;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 mb-2">My Profile</h1>
        <p className="text-slate-600">Manage your personal information and preferences</p>
      </div>

      {/* Profile Overview */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {formData.avatar_url ? (
                  <img
                    src={resolveAvatarUrl()}
                    alt="Profile avatar"
                    className="size-24 rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="size-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-3xl">
                    {formData.name[0].toUpperCase()}
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white">
                    <Loader2 className="size-6 animate-spin" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <button
                  type="button"
                  title="Change profile photo"
                  className="absolute bottom-0 right-0 size-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-70"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Camera className="size-4" />
                </button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Camera className="size-4 mr-2" />
                Change Photo
              </Button>
              <p className="text-xs text-slate-500 text-center max-w-[8rem]">
                PNG or JPG, up to 5&nbsp;MB
              </p>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-slate-900 mb-1">{formData.name}</h2>
                  <p className="text-slate-600 mb-2">{formData.role} at {formData.company}</p>
                  <div className="flex gap-2">
                    <Badge className="bg-blue-600 flex items-center gap-1">
                      <Crown className="size-3" />
                      Professional Plan
                    </Badge>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                </div>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "outline" : "default"}
                >
                  <Edit className="size-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
              <p className="text-slate-700">{formData.bio}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          { label: "Total Calls", value: "1,247", icon: Phone, color: "from-blue-500 to-cyan-500" },
          { label: "Active Agents", value: "8", icon: User, color: "from-purple-500 to-pink-500" },
          { label: "Member Since", value: "Jan 2025", icon: Calendar, color: "from-green-500 to-emerald-500" },
          { label: "Minutes Used", value: "3,842", icon: Phone, color: "from-orange-500 to-red-500" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-white border-slate-200">
            <CardContent className="p-6">
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${stat.color} mb-3`}>
                <stat.icon className="size-5 text-white" />
              </div>
              <div className="text-2xl text-slate-900 mb-1">{stat.value}</div>
              <div className="text-slate-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Personal Information */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="border-b">
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role/Position</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="border-b">
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[
              {
                field: "language" as PreferenceField,
                label: "Language",
                description: getLanguageLabel(formData.language),
                options: languageOptions,
              },
              {
                field: "timezone" as PreferenceField,
                label: "Timezone",
                description: formData.timezone,
                options: timezoneOptions.map((tz) => ({ value: tz, label: tz })),
              },
              {
                field: "date_format" as PreferenceField,
                label: "Date Format",
                description: formData.date_format,
                options: dateFormatOptions.map((df) => ({ value: df, label: df })),
              },
            ].map((pref) => {
              const isEditingPref = activePreference === pref.field;
              return (
                <div
                  key={pref.field}
                  className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="text-slate-900">{pref.label}</p>
                    <p className="text-slate-600 text-sm">{pref.description}</p>
                  </div>
                  {isEditingPref ? (
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                      <select
                        className="flex-1 rounded-md border border-slate-300 px-3 py-2"
                        value={preferenceDraft[pref.field]}
                        onChange={(e) => handlePreferenceValueChange(pref.field, e.target.value)}
                      >
                        {pref.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handlePreferenceSave(pref.field)}
                          disabled={isPreferenceSaving}
                        >
                          {isPreferenceSaving ? "Saving..." : "Save"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setActivePreference(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => startPreferenceEdit(pref.field)}>
                      Change
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
