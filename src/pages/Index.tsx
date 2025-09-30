import { useState } from "react";
import { AuthForm } from "@/components/AuthForm";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const handleLogin = (email: string) => {
    setCurrentUser(email);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <AuthForm onLogin={handleLogin} />;
  }

  return <Dashboard currentUser={currentUser} onLogout={handleLogout} />;
};

export default Index;
