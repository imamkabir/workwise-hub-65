import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { Overview } from "./Overview";
import { Analytics } from "./Analytics";
import { Projects } from "./Projects";
import { Profile } from "./Profile";
import { Settings } from "./Settings";
import { FileUpload } from "./FileUpload";
import { FileManagement } from "./FileManagement";
import { UserManagement } from "./UserManagement";
import { FileBrowser } from "./FileBrowser";
import { EarnCredits } from "./EarnCredits";
import { UserDownloads } from "./UserDownloads";
import { ReferralDashboard } from "./ReferralDashboard";
import { TransactionHistory } from "./TransactionHistory";
import { SuperAdminDashboard } from "./SuperAdminDashboard";

interface DashboardProps {
  currentUser: string;
  onLogout: () => void;
}

export const Dashboard = ({ currentUser, onLogout }: DashboardProps) => {
  // Determine user role from backend token
  const getUserRole = () => {
    // Get role from stored backend response
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      return storedRole;
    }
    
    // Fallback logic for demo mode - Super Admin check first
    if (currentUser === "imamkabir397@gmail.com") {
      return "super_admin"; // Always super admin for this email
    }
    if (currentUser === "admin") return "admin";
    return "user";
  };
  
  const userRole = getUserRole();
  
  // If user is Super Admin, show dedicated Super Admin dashboard
  if (userRole === "super_admin") {
    return <SuperAdminDashboard currentUser={currentUser} onLogout={onLogout} />;
  }
  
  const [activeTab, setActiveTab] = useState(userRole === "admin" ? "overview" : "browse");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [userCredits, setUserCredits] = useState(25); // Mock user credits

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("light");
  };

  const renderContent = () => {
    // Use the same role detection as above
    
    switch (activeTab) {
      // Admin routes
      case "overview":
        return <Overview currentUser={currentUser} />;
      case "upload":
        return <FileUpload />;
      case "files":
        return <FileManagement />;
      case "users":
        return <UserManagement />;
      case "analytics":
        return <Analytics />;
        
      // User routes
      case "browse":
        return <FileBrowser userCredits={userCredits} onCreditUpdate={setUserCredits} />;
      case "downloads":
        return <UserDownloads />;
      case "credits":
        return <EarnCredits userCredits={userCredits} onCreditUpdate={setUserCredits} />;
      case "referrals":
        return <ReferralDashboard userCredits={userCredits} onCreditUpdate={setUserCredits} />;
      case "transactions":
        return <TransactionHistory userCredits={userCredits} />;
        
      // Common routes
      case "projects":
        return <Projects />;
      case "profile":
        return <Profile currentUser={currentUser} />;
      case "settings":
        return <Settings isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />;
      default:
        return (userRole === "admin") ? <Overview currentUser={currentUser} /> : <FileBrowser userCredits={userCredits} onCreditUpdate={setUserCredits} />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        userRole={userRole}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          currentUser={currentUser}
          activeTab={activeTab}
          onLogout={onLogout}
          onTabChange={setActiveTab}
        />
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};