import { useState } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  currentUser: string;
  activeTab: string;
  onLogout: () => void;
  onTabChange: (tab: string) => void;
}

export const DashboardHeader = ({ currentUser, activeTab, onLogout, onTabChange }: DashboardHeaderProps) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case "overview": return "Overview";
      case "analytics": return "Analytics";
      case "projects": return "Projects";
      case "profile": return "Profile";
      case "settings": return "Settings";
      default: return "Dashboard";
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = "Good evening";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    
    return `${greeting}, ${currentUser === "admin" ? "Admin" : currentUser}!`;
  };

  return (
    <header className="flex items-center justify-between p-6 border-b border-border/50 glass backdrop-blur-sm">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{getTabTitle()}</h1>
        <p className="text-muted-foreground">{getWelcomeMessage()}</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 glass">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder-avatar.jpg" alt={currentUser} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {currentUser === "admin" ? "AD" : currentUser.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{currentUser === "admin" ? "Admin" : currentUser}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass">
            <DropdownMenuItem onClick={() => onTabChange("profile")}>
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTabChange("settings")}>
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};