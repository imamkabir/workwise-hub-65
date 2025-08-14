import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { Overview } from "./Overview";
import { Analytics } from "./Analytics";
import { Projects } from "./Projects";
import { Profile } from "./Profile";
import { Settings } from "./Settings";

interface DashboardProps {
  currentUser: string;
  onLogout: () => void;
}

export const Dashboard = ({ currentUser, onLogout }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("light");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview currentUser={currentUser} />;
      case "analytics":
        return <Analytics />;
      case "projects":
        return <Projects />;
      case "profile":
        return <Profile currentUser={currentUser} />;
      case "settings":
        return <Settings isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />;
      default:
        return <Overview currentUser={currentUser} />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
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