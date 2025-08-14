import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Bell, Shield, Globe, Palette, Clock, Database, Download } from "lucide-react";

interface SettingsProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Settings = ({ isDarkMode, onToggleTheme }: SettingsProps) => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      desktop: true,
      weekly_reports: true,
    },
    privacy: {
      profile_visibility: 'team',
      activity_tracking: true,
      data_sharing: false,
    },
    preferences: {
      language: 'english',
      timezone: 'utc-5',
      date_format: 'mm/dd/yyyy',
      time_format: '12h',
    },
    security: {
      two_factor: false,
      session_timeout: '30',
      login_alerts: true,
    }
  });

  const { toast } = useToast();

  const handleSave = (section: string) => {
    toast({
      title: "✅ Settings Saved",
      description: `${section} settings have been updated successfully.`,
    });
  };

  const handleExportData = () => {
    toast({
      title: "📥 Export Started",
      description: "Your data export will be ready shortly. You'll receive an email when it's complete.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.notifications.email}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, email: checked }
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Browser notifications</p>
            </div>
            <Switch
              id="push-notifications"
              checked={settings.notifications.push}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, push: checked }
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="desktop-notifications">Desktop Notifications</Label>
              <p className="text-sm text-muted-foreground">System notifications</p>
            </div>
            <Switch
              id="desktop-notifications"
              checked={settings.notifications.desktop}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, desktop: checked }
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weekly-reports">Weekly Reports</Label>
              <p className="text-sm text-muted-foreground">Receive weekly attendance summaries</p>
            </div>
            <Switch
              id="weekly-reports"
              checked={settings.notifications.weekly_reports}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, weekly_reports: checked }
                })
              }
            />
          </div>

          <Button onClick={() => handleSave('Notification')} className="gradient-primary">
            Save Notification Settings
          </Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Appearance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Theme Mode</Label>
              <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
            </div>
            <Button
              onClick={onToggleTheme}
              variant="outline"
              className="glass"
            >
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={settings.preferences.language}>
              <SelectTrigger className="glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="german">German</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => handleSave('Appearance')} className="gradient-primary">
            Save Appearance Settings
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Privacy & Security */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Privacy & Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-visibility">Profile Visibility</Label>
              <Select value={settings.privacy.profile_visibility}>
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="team">Team Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add extra security to your account</p>
              </div>
              <Switch
                id="two-factor"
                checked={settings.security.two_factor}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    security: { ...settings.security, two_factor: checked }
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="login-alerts">Login Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified of new logins</p>
              </div>
              <Switch
                id="login-alerts"
                checked={settings.security.login_alerts}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    security: { ...settings.security, login_alerts: checked }
                  })
                }
              />
            </div>

            <Button onClick={() => handleSave('Security')} className="gradient-primary w-full">
              Save Security Settings
            </Button>
          </CardContent>
        </Card>

        {/* Time & Localization */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Time & Localization</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={settings.preferences.timezone}>
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc-8">UTC-8 (Pacific)</SelectItem>
                  <SelectItem value="utc-7">UTC-7 (Mountain)</SelectItem>
                  <SelectItem value="utc-6">UTC-6 (Central)</SelectItem>
                  <SelectItem value="utc-5">UTC-5 (Eastern)</SelectItem>
                  <SelectItem value="utc+0">UTC+0 (GMT)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-format">Date Format</Label>
              <Select value={settings.preferences.date_format}>
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time-format">Time Format</Label>
              <Select value={settings.preferences.time_format}>
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12 Hour</SelectItem>
                  <SelectItem value="24h">24 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => handleSave('Time & Localization')} className="gradient-primary w-full">
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Data Management */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Data Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleExportData}
              variant="outline"
              className="glass"
            >
              <Download className="w-4 h-4 mr-2" />
              Export My Data
            </Button>
            
            <Button
              variant="outline"
              className="glass text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/10"
            >
              <Shield className="w-4 h-4 mr-2" />
              Privacy Policy
            </Button>
          </div>
          
          <Separator />
          
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <h4 className="font-semibold text-red-400 mb-2">Danger Zone</h4>
            <p className="text-sm text-muted-foreground mb-3">
              These actions cannot be undone. Please proceed with caution.
            </p>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};