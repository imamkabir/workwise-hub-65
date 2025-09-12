import { useState } from "react";
import { EnhancedAuthForm } from "@/components/EnhancedAuthForm";
import { AdvancedFeatures } from "@/components/AdvancedFeatures";
import { CustomCursor, MatrixRain, CyberpunkGrid, QuantumEntanglement, NeuralNetwork, DataStream, EMPulse } from "@/components/InteractiveEffects";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [empTrigger, setEmpTrigger] = useState(false);

  const handleLogin = (email: string) => {
    setCurrentUser(email);
    setEmpTrigger(true);
    setTimeout(() => setEmpTrigger(false), 2000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        {/* Background Effects */}
        <MatrixRain />
        <CyberpunkGrid />
        <QuantumEntanglement />
        <NeuralNetwork />
        <DataStream />
        
        {/* Custom Cursor */}
        <CustomCursor />
        
        {/* EMP Effect */}
        <EMPulse trigger={empTrigger} />
        
        {/* Main Auth Interface */}
        <EnhancedAuthForm onLogin={handleLogin} />
        
        {/* Advanced Features */}
        <AdvancedFeatures onLogin={handleLogin} />
      </div>
    );
  }

  return <Dashboard currentUser={currentUser} onLogout={handleLogout} />;
};

export default Index;
