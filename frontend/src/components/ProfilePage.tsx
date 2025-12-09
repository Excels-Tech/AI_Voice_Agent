import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { User, Mail, Phone, MapPin, Calendar, Edit, Camera, Crown } from "lucide-react";
import { toast } from "sonner";

interface ProfilePageProps {
  user: { name: string; email: string };
}

export function ProfilePage({ user }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: "+1 (555) 123-4567",
    company: "Tech Corp Inc.",
    role: "Product Manager",
    location: "San Francisco, CA",
    timezone: "UTC-8 (PST)",
    bio: "Building amazing AI voice solutions for modern businesses.",
  });

  const handleSave = () => {
    toast.success("Profile updated successfully");
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white mb-2">My Profile</h1>
        <p className="text-slate-400">Manage your personal information and preferences</p>
      </div>

      {/* Profile Overview */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="size-24 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl shadow-lg shadow-blue-500/20">
                {user.name[0].toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 size-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center hover:shadow-lg hover:shadow-blue-500/30 transition-all">
                <Camera className="size-4" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-white mb-1">{formData.name}</h2>
                  <p className="text-slate-400 mb-2">{formData.role} at {formData.company}</p>
                  <div className="flex gap-2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 flex items-center gap-1 hover:shadow-lg hover:shadow-blue-500/30">
                      <Crown className="size-3" />
                      Professional Plan
                    </Badge>
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">Active</Badge>
                  </div>
                </div>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "outline" : "default"}
                  className={isEditing ? "border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" : "bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg hover:shadow-blue-500/30"}
                >
                  <Edit className="size-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
              <p className="text-slate-300">{formData.bio}</p>
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
          <Card key={stat.label} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
            <CardContent className="p-6">
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${stat.color} mb-3 shadow-lg`}>
                <stat.icon className="size-5 text-white" />
              </div>
              <div className="text-2xl text-white mb-1">{stat.value}</div>
              <div className="text-slate-400">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Personal Information */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="border-b border-slate-800">
          <CardTitle className="text-white">Personal Information</CardTitle>
          <CardDescription className="text-slate-400">Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-slate-300">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                disabled={!isEditing}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-slate-300">Role/Position</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                disabled={!isEditing}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-slate-300">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                disabled={!isEditing}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio" className="text-slate-300">Bio</Label>
              <Input
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 mt-6">
              <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg hover:shadow-blue-500/30">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="border-b border-slate-800">
          <CardTitle className="text-white">Preferences</CardTitle>
          <CardDescription className="text-slate-400">Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-slate-800 rounded-lg bg-slate-800/50 hover:border-slate-700 transition-colors">
              <div>
                <p className="text-white">Language</p>
                <p className="text-slate-400 text-sm">English (US)</p>
              </div>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white">Change</Button>
            </div>
            <div className="flex items-center justify-between p-4 border border-slate-800 rounded-lg bg-slate-800/50 hover:border-slate-700 transition-colors">
              <div>
                <p className="text-white">Timezone</p>
                <p className="text-slate-400 text-sm">{formData.timezone}</p>
              </div>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white">Change</Button>
            </div>
            <div className="flex items-center justify-between p-4 border border-slate-800 rounded-lg bg-slate-800/50 hover:border-slate-700 transition-colors">
              <div>
                <p className="text-white">Date Format</p>
                <p className="text-slate-400 text-sm">MM/DD/YYYY</p>
              </div>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white">Change</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}