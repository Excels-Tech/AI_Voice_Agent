import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Palette,
  Upload,
  Globe,
  Mail,
  Save,
  Eye,
  RefreshCw,
  Crown,
  Link,
  Image as ImageIcon,
  Type,
} from "lucide-react";
import { toast } from "sonner";

export function WhiteLabelSettings() {
  const [branding, setBranding] = useState({
    companyName: "VoiceAI Pro",
    customDomain: "calls.mybusiness.com",
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#3b82f6",
    secondaryColor: "#6366f1",
    accentColor: "#8b5cf6",
    supportEmail: "support@mybusiness.com",
    supportUrl: "https://help.mybusiness.com",
    smtpHost: "smtp.sendgrid.net",
    smtpPort: "587",
    smtpUser: "apikey",
    smtpPassword: "**********",
  });

  const handleSave = () => {
    toast.success("White-label settings saved successfully!");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate upload
      const fakeUrl = URL.createObjectURL(file);
      setBranding({ ...branding, logoUrl: fakeUrl });
      toast.success("Logo uploaded successfully");
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file);
      setBranding({ ...branding, faviconUrl: fakeUrl });
      toast.success("Favicon uploaded successfully");
    }
  };

  const handleTestEmail = () => {
    toast.success("Test email sent successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white mb-2 flex items-center gap-2">
            <Crown className="size-6 text-yellow-400" />
            White-Label & Branding
          </h1>
          <p className="text-slate-400">Customize your platform with your brand identity</p>
        </div>
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg shadow-yellow-500/30">
          Enterprise Feature
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Branding */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Type className="size-5 text-blue-400" />
                Basic Information
              </CardTitle>
              <CardDescription className="text-slate-400">Set your company name and domain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-slate-300">Company Name</Label>
                <Input
                  id="companyName"
                  value={branding.companyName}
                  onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
                  placeholder="Your Company Name"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customDomain" className="text-slate-300">Custom Domain</Label>
                <div className="flex gap-2">
                  <Input
                    id="customDomain"
                    value={branding.customDomain}
                    onChange={(e) => setBranding({ ...branding, customDomain: e.target.value })}
                    placeholder="app.yourdomain.com"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                  <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                    <Link className="size-4 mr-2" />
                    Verify
                  </Button>
                </div>
                <p className="text-slate-500 text-sm">
                  Point your DNS CNAME record to: platform.voiceai.app
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Visual Branding */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <ImageIcon className="size-5 text-purple-400" />
                Visual Identity
              </CardTitle>
              <CardDescription className="text-slate-400">Upload your logo and set brand colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Company Logo</Label>
                  <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center bg-slate-800/50">
                    {branding.logoUrl ? (
                      <div className="space-y-3">
                        <img
                          src={branding.logoUrl}
                          alt="Logo"
                          className="max-h-16 mx-auto"
                        />
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <Button variant="outline" size="sm" className="pointer-events-none border-slate-700 text-slate-300 hover:bg-slate-700">
                            <RefreshCw className="size-4 mr-2" />
                            Change
                          </Button>
                        </label>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <Upload className="size-8 mx-auto mb-2 text-slate-500" />
                        <p className="text-slate-400 text-sm">Upload Logo</p>
                        <p className="text-slate-500 text-xs mt-1">PNG, SVG (max 2MB)</p>
                      </label>
                    )}
                  </div>
                </div>

                {/* Favicon Upload */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Favicon</Label>
                  <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center bg-slate-800/50">
                    {branding.faviconUrl ? (
                      <div className="space-y-3">
                        <img
                          src={branding.faviconUrl}
                          alt="Favicon"
                          className="size-16 mx-auto"
                        />
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFaviconUpload}
                            className="hidden"
                          />
                          <Button variant="outline" size="sm" className="pointer-events-none border-slate-700 text-slate-300 hover:bg-slate-700">
                            <RefreshCw className="size-4 mr-2" />
                            Change
                          </Button>
                        </label>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFaviconUpload}
                          className="hidden"
                        />
                        <Upload className="size-8 mx-auto mb-2 text-slate-500" />
                        <p className="text-slate-400 text-sm">Upload Favicon</p>
                        <p className="text-slate-500 text-xs mt-1">ICO, PNG (32x32)</p>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Color Scheme */}
              <div className="space-y-4">
                <Label className="text-slate-300">Brand Colors</Label>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor" className="text-sm text-slate-300">
                      Primary Color
                    </Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        id="primaryColor"
                        value={branding.primaryColor}
                        onChange={(e) =>
                          setBranding({ ...branding, primaryColor: e.target.value })
                        }
                        className="size-10 rounded border-2 cursor-pointer"
                      />
                      <Input
                        value={branding.primaryColor}
                        onChange={(e) =>
                          setBranding({ ...branding, primaryColor: e.target.value })
                        }
                        className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor" className="text-sm text-slate-300">
                      Secondary Color
                    </Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        id="secondaryColor"
                        value={branding.secondaryColor}
                        onChange={(e) =>
                          setBranding({ ...branding, secondaryColor: e.target.value })
                        }
                        className="size-10 rounded border-2 cursor-pointer"
                      />
                      <Input
                        value={branding.secondaryColor}
                        onChange={(e) =>
                          setBranding({ ...branding, secondaryColor: e.target.value })
                        }
                        className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accentColor" className="text-sm text-slate-300">
                      Accent Color
                    </Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        id="accentColor"
                        value={branding.accentColor}
                        onChange={(e) =>
                          setBranding({ ...branding, accentColor: e.target.value })
                        }
                        className="size-10 rounded border-2 cursor-pointer"
                      />
                      <Input
                        value={branding.accentColor}
                        onChange={(e) =>
                          setBranding({ ...branding, accentColor: e.target.value })
                        }
                        className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Settings */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Globe className="size-5" />
                Support & Contact
              </CardTitle>
              <CardDescription className="text-slate-400">Configure support contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supportEmail" className="text-slate-300">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={branding.supportEmail}
                  onChange={(e) => setBranding({ ...branding, supportEmail: e.target.value })}
                  placeholder="support@yourdomain.com"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportUrl" className="text-slate-300">Support Portal URL</Label>
                <Input
                  id="supportUrl"
                  type="url"
                  value={branding.supportUrl}
                  onChange={(e) => setBranding({ ...branding, supportUrl: e.target.value })}
                  placeholder="https://help.yourdomain.com"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* SMTP Configuration */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Mail className="size-5" />
                SMTP Configuration
              </CardTitle>
              <CardDescription className="text-slate-400">
                Configure your own email server for transactional emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost" className="text-slate-300">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={branding.smtpHost}
                    onChange={(e) => setBranding({ ...branding, smtpHost: e.target.value })}
                    placeholder="smtp.sendgrid.net"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort" className="text-slate-300">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={branding.smtpPort}
                    onChange={(e) => setBranding({ ...branding, smtpPort: e.target.value })}
                    placeholder="587"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUser" className="text-slate-300">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    value={branding.smtpUser}
                    onChange={(e) => setBranding({ ...branding, smtpUser: e.target.value })}
                    placeholder="apikey"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword" className="text-slate-300">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={branding.smtpPassword}
                    onChange={(e) => setBranding({ ...branding, smtpPassword: e.target.value })}
                    placeholder="••••••••••"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
              <Button variant="outline" onClick={handleTestEmail}>
                <Mail className="size-4 mr-2" />
                Send Test Email
              </Button>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700">
            <Save className="size-4 mr-2" />
            Save White-Label Settings
          </Button>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-900 border-slate-800 sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Eye className="size-5 text-green-400" />
                Live Preview
              </CardTitle>
              <CardDescription className="text-slate-400">See how your branding looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Header Preview */}
              <div
                className="p-4 rounded-lg border-2"
                style={{
                  background: `linear-gradient(to right, ${branding.primaryColor}, ${branding.secondaryColor})`,
                }}
              >
                <div className="flex items-center gap-3">
                  {branding.logoUrl ? (
                    <img src={branding.logoUrl} alt="Logo" className="h-8" />
                  ) : (
                    <div className="size-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                      <Palette className="size-6" />
                    </div>
                  )}
                  <span className="text-white">{branding.companyName}</span>
                </div>
              </div>

              {/* Button Preview */}
              <div className="space-y-2">
                <p className="text-slate-300 text-sm">Primary Button</p>
                <button
                  className="w-full py-2 px-4 rounded-lg text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  Get Started
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-slate-300 text-sm">Secondary Button</p>
                <button
                  className="w-full py-2 px-4 rounded-lg text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: branding.secondaryColor }}
                >
                  Learn More
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-slate-300 text-sm">Accent Elements</p>
                <div className="flex gap-2">
                  <div
                    className="flex-1 h-12 rounded-lg"
                    style={{ backgroundColor: branding.accentColor }}
                  />
                  <div
                    className="flex-1 h-12 rounded-lg opacity-50"
                    style={{ backgroundColor: branding.accentColor }}
                  />
                  <div
                    className="flex-1 h-12 rounded-lg opacity-25"
                    style={{ backgroundColor: branding.accentColor }}
                  />
                </div>
              </div>

              {/* Color Codes */}
              <div className="space-y-2 pt-4 border-t border-slate-700">
                <p className="text-slate-300 text-sm">Color Codes</p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Primary</span>
                    <code className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300">
                      {branding.primaryColor}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Secondary</span>
                    <code className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300">
                      {branding.secondaryColor}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Accent</span>
                    <code className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300">
                      {branding.accentColor}
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enterprise Notice */}
      <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Crown className="size-8 text-yellow-400 shrink-0" />
            <div>
              <h3 className="text-yellow-400 mb-2">White-Label Access</h3>
              <p className="text-slate-300 mb-4">
                White-label branding is available on Enterprise plans. Customize the platform with
                your brand identity, custom domain, and SMTP configuration.
              </p>
              <Button
                variant="outline"
                onClick={() => toast.success("Contact sales form opened")}
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}