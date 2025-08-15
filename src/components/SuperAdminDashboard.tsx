import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Activity, 
  Shield, 
  Settings, 
  CreditCard, 
  FileText, 
  ToggleLeft, 
  Bell, 
  AlertTriangle,
  Eye,
  Download,
  BarChart3,
  Bug,
  UserCheck,
  Wrench,
  UserPlus,
  Crown,
  Globe,
  Server,
  Database,
  Zap,
  Lock,
  Unlock,
  Ban,
  CheckCircle,
  XCircle,
  DollarSign,
  Upload,
  MessageSquare,
  Trash2,
  Edit,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SuperAdminDashboardProps {
  currentUser: string;
  onLogout: () => void;
}

export const SuperAdminDashboard = ({ currentUser, onLogout }: SuperAdminDashboardProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [liveUsers, setLiveUsers] = useState(12);
  const [systemHealth, setSystemHealth] = useState(98);
  const [totalUsers, setTotalUsers] = useState(1247);
  const [totalRevenue, setTotalRevenue] = useState(45890);
  const [totalFiles, setTotalFiles] = useState(8923);
  
  // Mock data for demonstration
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", role: "user", credits: 150, status: "active", lastActive: "2 mins ago" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "admin", credits: 500, status: "active", lastActive: "5 mins ago" },
    { id: 3, name: "Bob Wilson", email: "bob@example.com", role: "user", credits: 75, status: "suspended", lastActive: "1 hour ago" },
  ]);

  const [activityLogs, setActivityLogs] = useState([
    { id: 1, user: "John Doe", action: "File uploaded", timestamp: "2 mins ago", type: "info" },
    { id: 2, user: "Jane Smith", action: "User created", timestamp: "5 mins ago", type: "success" },
    { id: 3, user: "System", action: "Failed login attempt", timestamp: "10 mins ago", type: "warning" },
    { id: 4, user: "Bob Wilson", action: "Account suspended", timestamp: "1 hour ago", type: "error" },
  ]);

  const [systemSettings, setSystemSettings] = useState({
    siteName: "Iconic Portal",
    primaryColor: "#3b82f6",
    allowRegistration: true,
    allowFileUploads: true,
    maxFileSize: "100MB",
    maintenanceMode: false,
    emailNotifications: true,
  });

  const handleUserAction = (userId: number, action: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, status: action === 'suspend' ? 'suspended' : action === 'activate' ? 'active' : u.status }
          : u
      ));
      toast({
        title: "✅ Action Completed",
        description: `User ${user.name} has been ${action}d successfully.`,
      });
    }
  };

  const handleCreditUpdate = (userId: number, newCredits: number) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, credits: newCredits } : u
    ));
    toast({
      title: "💰 Credits Updated",
      description: `User credits updated successfully.`,
    });
  };

  const toggleMaintenanceMode = () => {
    setIsMaintenanceMode(!isMaintenanceMode);
    setSystemSettings({ ...systemSettings, maintenanceMode: !isMaintenanceMode });
    toast({
      title: isMaintenanceMode ? "🟢 Site Online" : "🔴 Maintenance Mode",
      description: isMaintenanceMode ? "Site is now live for all users." : "Site is now in maintenance mode.",
    });
  };

  const exportData = (format: string) => {
    toast({
      title: "📄 Export Started",
      description: `Generating ${format.toUpperCase()} export...`,
    });
  };

  const sendGlobalNotification = (message: string) => {
    toast({
      title: "📢 Global Notification Sent",
      description: `Message sent to all ${totalUsers} users.`,
    });
  };

  useEffect(() => {
    // Simulate live data updates
    const interval = setInterval(() => {
      setLiveUsers(Math.floor(Math.random() * 20) + 8);
      setSystemHealth(Math.floor(Math.random() * 5) + 95);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Super Admin Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Crown className="h-8 w-8 text-yellow-500" />
            <div>
              <h1 className="text-2xl font-bold text-primary">Super Admin Control Center</h1>
              <p className="text-sm text-muted-foreground">Ultimate control over {systemSettings.siteName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={isMaintenanceMode ? "destructive" : "default"} className="animate-pulse">
              {isMaintenanceMode ? "MAINTENANCE" : "LIVE"}
            </Badge>
            <Badge variant="outline">{liveUsers} Users Online</Badge>
            <Button onClick={toggleMaintenanceMode} variant={isMaintenanceMode ? "default" : "destructive"}>
              {isMaintenanceMode ? <CheckCircle className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
              {isMaintenanceMode ? "Go Live" : "Maintenance"}
            </Button>
            <Button onClick={onLogout} variant="outline">Logout</Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="glass hover:bg-primary/5 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="glass hover:bg-primary/5 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>

          <Card className="glass hover:bg-primary/5 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalFiles.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+156 today</p>
            </CardContent>
          </Card>

          <Card className="glass hover:bg-primary/5 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{systemHealth}%</div>
              <Progress value={systemHealth} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 lg:grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="finances">Finances</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Live Activity Feed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center space-x-3 p-3 rounded-lg bg-background/50">
                      <div className={`w-2 h-2 rounded-full ${
                        log.type === 'success' ? 'bg-green-500' :
                        log.type === 'warning' ? 'bg-yellow-500' :
                        log.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="text-xs text-muted-foreground">{log.user} • {log.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full justify-start">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Global Notification
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send Global Notification</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea placeholder="Enter your message..." />
                        <Button onClick={() => sendGlobalNotification("Test message")} className="w-full">
                          Send to All Users
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="w-full justify-start" onClick={() => exportData('csv')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export User Data (CSV)
                  </Button>

                  <Button variant="outline" className="w-full justify-start" onClick={() => exportData('pdf')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Analytics (PDF)
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create Admin Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Admin</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input placeholder="Admin Name" />
                        <Input placeholder="Admin Email" />
                        <Input placeholder="Password" type="password" />
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="small_admin">Small Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button className="w-full">Create Admin</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    User Management
                  </span>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                            <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                              {user.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">{user.credits} Credits</p>
                          <p className="text-xs text-muted-foreground">{user.lastActive}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleCreditUpdate(user.id, user.credits + 100)}>
                            <CreditCard className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant={user.status === 'active' ? 'destructive' : 'default'}
                            onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
                          >
                            {user.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  System Activity Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-center space-x-4 p-3 rounded-lg bg-background/50">
                      <div className={`w-3 h-3 rounded-full ${
                        log.type === 'success' ? 'bg-green-500' :
                        log.type === 'warning' ? 'bg-yellow-500' :
                        log.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{log.action}</p>
                          <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">by {log.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Site Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Site Name</label>
                    <Input value={systemSettings.siteName} onChange={(e) => setSystemSettings({...systemSettings, siteName: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Primary Color</label>
                    <Input type="color" value={systemSettings.primaryColor} onChange={(e) => setSystemSettings({...systemSettings, primaryColor: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max File Size</label>
                    <Input value={systemSettings.maxFileSize} onChange={(e) => setSystemSettings({...systemSettings, maxFileSize: e.target.value})} />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ToggleLeft className="h-5 w-5 mr-2" />
                    Feature Toggles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Allow Registration</label>
                    <Switch 
                      checked={systemSettings.allowRegistration} 
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, allowRegistration: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Allow File Uploads</label>
                    <Switch 
                      checked={systemSettings.allowFileUploads} 
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, allowFileUploads: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Email Notifications</label>
                    <Switch 
                      checked={systemSettings.emailNotifications} 
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, emailNotifications: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Maintenance Mode</label>
                    <Switch 
                      checked={systemSettings.maintenanceMode} 
                      onCheckedChange={toggleMaintenanceMode}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Additional tabs would continue here... */}
          <TabsContent value="finances" className="space-y-6">
            <Alert>
              <DollarSign className="h-4 w-4" />
              <AlertDescription>
                Financial dashboard with payment history, revenue analytics, and credit management is available here.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                File management system with upload monitoring, storage usage, and file organization tools.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Security center with threat monitoring, access logs, and security configuration options.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Alert>
              <Server className="h-4 w-4" />
              <AlertDescription>
                System monitoring with server health, database status, and performance metrics.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};