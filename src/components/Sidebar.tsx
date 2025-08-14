import { Home, BarChart3, FolderOpen, User, Settings, Sun, Moon, Upload, Users, FileText, CreditCard, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  userRole: string;
}

const adminNavigation = [
  { id: "overview", label: "Dashboard", icon: Home },
  { id: "upload", label: "Upload Files", icon: Upload },
  { id: "files", label: "Manage Files", icon: FileText },
  { id: "users", label: "Users", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
];

const userNavigation = [
  { id: "browse", label: "Browse Files", icon: FolderOpen },
  { id: "downloads", label: "My Downloads", icon: Download },
  { id: "credits", label: "Earn Credits", icon: CreditCard },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
];

export const Sidebar = ({ activeTab, onTabChange, isDarkMode, onToggleTheme, userRole }: SidebarProps) => {
  const navigation = userRole === "admin" ? adminNavigation : userNavigation;

  return (
    <aside className="w-64 h-screen glass border-r border-border/50 flex flex-col">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🌀</div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            IconicShare
          </h2>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                  "hover:bg-secondary/50 hover:scale-105",
                  activeTab === item.id 
                    ? "bg-primary/20 text-primary border border-primary/30 glow" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      
      <div className="p-4 border-t border-border/50">
        <Button
          onClick={onToggleTheme}
          variant="outline"
          size="sm"
          className="w-full glass"
        >
          {isDarkMode ? (
            <>
              <Sun className="w-4 h-4 mr-2" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 mr-2" />
              Dark Mode
            </>
          )}
        </Button>
      </div>
    </aside>
  );
};