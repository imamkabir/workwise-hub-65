import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { 
  Fingerprint, 
  Smartphone, 
  Shield, 
  Zap, 
  Cpu, 
  Wifi, 
  Globe,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
  Scan,
  Radio,
  Satellite,
  Radar
} from 'lucide-react';

// Advanced Features Components

// Voice Command Component
const VoiceCommand = ({ onCommand }: { onCommand: (command: string) => void }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const command = event.results[0][0].transcript.toLowerCase();
        setTranscript(command);
        onCommand(command);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [onCommand]);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  return (
    <motion.button
      onClick={startListening}
      disabled={isListening}
      className="p-3 bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-md border border-green-500/30 rounded-lg hover:border-cyan-400/50 transition-all duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={isListening ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
      >
        <Radio className="w-6 h-6 text-green-400 mx-auto" />
      </motion.div>
      <p className="text-xs text-gray-300 mt-1 font-mono">
        {isListening ? 'Listening...' : 'Voice Login'}
      </p>
      {transcript && (
        <p className="text-xs text-cyan-400 mt-1">"{transcript}"</p>
      )}
    </motion.button>
  );
};

// Security Scanner Component
const SecurityScanner = ({ isActive }: { isActive: boolean }) => {
  const [scanProgress, setScanProgress] = useState(0);
  const [threats, setThreats] = useState(0);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            setThreats(Math.floor(Math.random() * 3));
            return 100;
          }
          return prev + 2;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isActive]);

  return (
    <motion.div
      className="p-4 bg-black/30 backdrop-blur-md border border-green-500/30 rounded-lg"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <motion.div
          animate={isActive ? { rotate: 360 } : {}}
          transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
        >
          <Scan className="w-5 h-5 text-green-400" />
        </motion.div>
        <span className="text-green-400 font-mono text-sm">Security Scan</span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-gray-400">Progress</span>
          <span className="text-cyan-400">{scanProgress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-green-400 to-cyan-400 h-2 rounded-full"
            style={{ width: `${scanProgress}%` }}
            animate={{ boxShadow: '0 0 10px rgba(34, 211, 238, 0.5)' }}
          />
        </div>
        <div className="flex justify-between text-xs font-mono">
          <span className="text-gray-400">Threats Detected</span>
          <span className={threats > 0 ? "text-red-400" : "text-green-400"}>
            {threats}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Network Status Component
const NetworkStatus = () => {
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  const [latency, setLatency] = useState(42);
  const [bandwidth, setBandwidth] = useState(1.2);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(Math.random() * 50) + 20);
      setBandwidth(Math.random() * 2 + 0.5);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-4 left-4 p-3 bg-black/30 backdrop-blur-md border border-cyan-400/30 rounded-lg z-50">
      <div className="flex items-center gap-2 mb-2">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Satellite className="w-4 h-4 text-cyan-400" />
        </motion.div>
        <span className="text-cyan-400 font-mono text-xs">NETWORK STATUS</span>
      </div>
      <div className="space-y-1 text-xs font-mono">
        <div className="flex justify-between">
          <span className="text-gray-400">Status:</span>
          <span className="text-green-400">SECURE</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Latency:</span>
          <span className="text-cyan-400">{latency}ms</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Speed:</span>
          <span className="text-purple-400">{bandwidth.toFixed(1)} Gbps</span>
        </div>
      </div>
    </div>
  );
};

// Threat Detection Component
const ThreatDetection = () => {
  const [threats, setThreats] = useState<Array<{ id: number; type: string; severity: 'low' | 'medium' | 'high' }>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance of threat
        const threatTypes = ['Brute Force', 'SQL Injection', 'XSS Attempt', 'DDoS', 'Malware'];
        const severities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
        
        const newThreat = {
          id: Date.now(),
          type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
        };

        setThreats(prev => [...prev.slice(-4), newThreat]);
        
        toast.error(`🚨 ${newThreat.type} detected and blocked!`, {
          duration: 3000,
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (threats.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 max-w-xs z-50">
      <AnimatePresence>
        {threats.slice(-3).map((threat) => (
          <motion.div
            key={threat.id}
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className={cn(
              "mb-2 p-3 bg-black/80 backdrop-blur-md border rounded-lg",
              threat.severity === 'high' ? 'border-red-500/50' :
              threat.severity === 'medium' ? 'border-yellow-500/50' : 'border-green-500/50'
            )}
          >
            <div className="flex items-center gap-2">
              <Shield className={cn(
                "w-4 h-4",
                threat.severity === 'high' ? 'text-red-400' :
                threat.severity === 'medium' ? 'text-yellow-400' : 'text-green-400'
              )} />
              <span className="text-white font-mono text-xs">{threat.type}</span>
            </div>
            <p className="text-gray-400 font-mono text-xs mt-1">Threat neutralized</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Language Selector Component
const LanguageSelector = ({ language, setLanguage }: { language: string; setLanguage: (lang: string) => void }) => {
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ];

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
      <motion.select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="bg-black/30 backdrop-blur-md border border-purple-500/30 rounded-lg px-3 py-1 text-cyan-400 font-mono text-sm focus:outline-none focus:border-cyan-400"
        whileHover={{ scale: 1.05 }}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-black text-cyan-400">
            {lang.flag} {lang.name}
          </option>
        ))}
      </motion.select>
    </div>
  );
};

// Main Enhanced Auth Form
export const EnhancedAuthForm = ({ onLogin }: { onLogin: (email: string) => void }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isScanning, setIsScanning] = useState(false);
  const [language, setLanguage] = useState('en');

  // Voice command handler
  const handleVoiceCommand = (command: string) => {
    if (command.includes('log in') || command.includes('login')) {
      toast.success('🎤 Voice command recognized: Login');
      // Trigger login with demo credentials
      onLogin('voice@example.com');
    } else if (command.includes('register') || command.includes('sign up')) {
      toast.success('🎤 Voice command recognized: Register');
    } else {
      toast.error('🎤 Command not recognized');
    }
  };

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Start security scan on mount
  useEffect(() => {
    setIsScanning(true);
    const timer = setTimeout(() => setIsScanning(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative">
      {/* Network Status */}
      <NetworkStatus />

      {/* Language Selector */}
      <LanguageSelector language={language} setLanguage={setLanguage} />

      {/* Main Login Interface */}
      <FuturisticLogin onLogin={onLogin} />

      {/* Security Scanner */}
      <div className="fixed bottom-20 right-4 z-50">
        <SecurityScanner isActive={isScanning} />
      </div>

      {/* Voice Command */}
      <div className="fixed bottom-4 right-20 z-50">
        <VoiceCommand onCommand={handleVoiceCommand} />
      </div>

      {/* Threat Detection */}
      <ThreatDetection />

      {/* Accessibility Features */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
        >
          <motion.button
            className="p-2 bg-black/30 backdrop-blur-md border border-purple-500/30 rounded-lg hover:border-cyan-400/50 transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            title="High Contrast Mode"
          >
            <UserCheck className="w-4 h-4 text-purple-400" />
          </motion.button>
          
          <motion.button
            className="p-2 bg-black/30 backdrop-blur-md border border-purple-500/30 rounded-lg hover:border-cyan-400/50 transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            title="Reduce Motion"
          >
            <Radar className="w-4 h-4 text-cyan-400" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};