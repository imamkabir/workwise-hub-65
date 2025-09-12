import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Mic, 
  MapPin, 
  Thermometer, 
  Activity, 
  Bluetooth, 
  Usb, 
  HardDrive,
  Monitor,
  Gamepad2,
  Headphones,
  Keyboard,
  Mouse,
  Printer,
  Scanner,
  Webcam,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Server,
  Database,
  Cloud,
  Wifi,
  Signal,
  Battery,
  Power,
  Cpu,
  MemoryStick,
  CircuitBoard,
  Microchip,
  Zap,
  Bolt,
  Flash,
  Sparkles,
  Star,
  Rocket,
  Satellite,
  Radar,
  Radio,
  Antenna,
  Globe,
  Navigation,
  Compass,
  Map,
  Route,
  Car,
  Plane,
  Ship,
  Train,
  Bike,
  Walk,
  Run,
  Heart,
  Brain,
  Eye,
  Ear,
  Hand,
  Fingerprint,
  Shield,
  Lock,
  Unlock,
  Key,
  UserCheck,
  UserX,
  Users,
  User,
  Crown,
  Award,
  Medal,
  Trophy,
  Target,
  Crosshair,
  Focus,
  Scan,
  Search,
  Filter,
  Sort,
  List,
  Grid,
  Layout,
  Sidebar,
  Menu,
  MoreHorizontal,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
  CornerDownRight,
  Move,
  MousePointer,
  Hand as HandIcon,
  Grab,
  GrabIcon
} from 'lucide-react';

// Device Detection Component
const DeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    type: 'desktop',
    os: 'unknown',
    browser: 'unknown',
    screen: { width: 0, height: 0 },
    touch: false,
    orientation: 'landscape',
    connection: 'unknown',
    memory: 0,
    cores: 0,
  });

  useEffect(() => {
    const detectDevice = () => {
      const ua = navigator.userAgent;
      const screen = window.screen;
      
      setDeviceInfo({
        type: /Mobile|Android|iPhone|iPad/.test(ua) ? 'mobile' : 'desktop',
        os: /Windows/.test(ua) ? 'Windows' : /Mac/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'Unknown',
        browser: /Chrome/.test(ua) ? 'Chrome' : /Firefox/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : 'Unknown',
        screen: { width: screen.width, height: screen.height },
        touch: 'ontouchstart' in window,
        orientation: screen.width > screen.height ? 'landscape' : 'portrait',
        connection: (navigator as any).connection?.effectiveType || 'unknown',
        memory: (navigator as any).deviceMemory || 0,
        cores: navigator.hardwareConcurrency || 0,
      });
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  return (
    <motion.div
      className="fixed top-20 left-4 p-3 bg-black/30 backdrop-blur-md border border-purple-500/30 rounded-lg z-40"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Monitor className="w-4 h-4 text-purple-400" />
        <span className="text-purple-400 font-mono text-xs">DEVICE INFO</span>
      </div>
      <div className="space-y-1 text-xs font-mono">
        <div className="flex justify-between">
          <span className="text-gray-400">Type:</span>
          <span className="text-cyan-400">{deviceInfo.type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">OS:</span>
          <span className="text-cyan-400">{deviceInfo.os}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Browser:</span>
          <span className="text-cyan-400">{deviceInfo.browser}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Cores:</span>
          <span className="text-cyan-400">{deviceInfo.cores}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Memory:</span>
          <span className="text-cyan-400">{deviceInfo.memory}GB</span>
        </div>
      </div>
    </motion.div>
  );
};

// Performance Monitor Component
const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    fps: 60,
    memory: 0,
    loadTime: 0,
    renderTime: 0,
  });

  useEffect(() => {
    const startTime = performance.now();
    
    const updateMetrics = () => {
      const now = performance.now();
      const memory = (performance as any).memory?.usedJSHeapSize || 0;
      
      setMetrics({
        fps: Math.floor(Math.random() * 10) + 55,
        memory: Math.round(memory / 1024 / 1024),
        loadTime: Math.round(now - startTime),
        renderTime: Math.round(performance.now() % 100),
      });
    };

    const interval = setInterval(updateMetrics, 1000);
    updateMetrics();

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed bottom-20 left-4 p-3 bg-black/30 backdrop-blur-md border border-green-500/30 rounded-lg z-40"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-4 h-4 text-green-400" />
        <span className="text-green-400 font-mono text-xs">PERFORMANCE</span>
      </div>
      <div className="space-y-1 text-xs font-mono">
        <div className="flex justify-between">
          <span className="text-gray-400">FPS:</span>
          <span className="text-green-400">{metrics.fps}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Memory:</span>
          <span className="text-cyan-400">{metrics.memory}MB</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Load:</span>
          <span className="text-purple-400">{metrics.loadTime}ms</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Render:</span>
          <span className="text-yellow-400">{metrics.renderTime}ms</span>
        </div>
      </div>
    </motion.div>
  );
};

// Geolocation Component
const GeolocationTracker = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number; city: string } | null>(null);
  const [weather, setWeather] = useState<{ temp: number; condition: string } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({
            lat: latitude,
            lng: longitude,
            city: 'Unknown City', // Would normally use reverse geocoding
          });
          
          // Simulate weather data
          setWeather({
            temp: Math.floor(Math.random() * 30) + 10,
            condition: ['Clear', 'Cloudy', 'Rainy', 'Sunny'][Math.floor(Math.random() * 4)],
          });
        },
        () => {
          // Fallback to IP-based location
          setLocation({ lat: 0, lng: 0, city: 'Earth' });
        }
      );
    }
  }, []);

  if (!location) return null;

  return (
    <motion.div
      className="fixed top-40 left-4 p-3 bg-black/30 backdrop-blur-md border border-blue-500/30 rounded-lg z-40"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-4 h-4 text-blue-400" />
        <span className="text-blue-400 font-mono text-xs">LOCATION</span>
      </div>
      <div className="space-y-1 text-xs font-mono">
        <div className="flex justify-between">
          <span className="text-gray-400">City:</span>
          <span className="text-cyan-400">{location.city}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Coords:</span>
          <span className="text-cyan-400">{location.lat.toFixed(2)}, {location.lng.toFixed(2)}</span>
        </div>
        {weather && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-400">Temp:</span>
              <span className="text-cyan-400">{weather.temp}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Weather:</span>
              <span className="text-cyan-400">{weather.condition}</span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

// Biometric Scanner Component
const BiometricScanner = ({ onSuccess }: { onSuccess: () => void }) => {
  const [scanType, setScanType] = useState<'fingerprint' | 'face' | 'iris'>('fingerprint');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const startScan = async () => {
    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          onSuccess();
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const scanIcons = {
    fingerprint: Fingerprint,
    face: Camera,
    iris: Eye,
  };

  const ScanIcon = scanIcons[scanType];

  return (
    <motion.div
      className="p-4 bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-md border border-green-500/30 rounded-lg"
      whileHover={{ scale: 1.05 }}
    >
      <div className="text-center">
        <motion.div
          className="relative mb-4"
          animate={isScanning ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1, repeat: isScanning ? Infinity : 0 }}
        >
          <ScanIcon className="w-12 h-12 text-green-400 mx-auto" />
          {isScanning && (
            <motion.div
              className="absolute inset-0 border-2 border-cyan-400 rounded-full"
              animate={{ scale: [1, 1.5], opacity: [1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.div>

        <div className="flex gap-1 mb-3">
          {['fingerprint', 'face', 'iris'].map((type) => (
            <button
              key={type}
              onClick={() => setScanType(type as any)}
              className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                scanType === type ? 'bg-cyan-400/20 text-cyan-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {isScanning && (
          <div className="mb-3">
            <div className="w-full bg-gray-700 rounded-full h-1">
              <motion.div
                className="bg-gradient-to-r from-green-400 to-cyan-400 h-1 rounded-full"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{scanProgress}% complete</p>
          </div>
        )}

        <button
          onClick={startScan}
          disabled={isScanning}
          className="w-full py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white font-mono text-sm rounded-lg disabled:opacity-50"
        >
          {isScanning ? 'SCANNING...' : 'START SCAN'}
        </button>
      </div>
    </motion.div>
  );
};

// System Diagnostics Component
const SystemDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    temperature: 0,
    uptime: 0,
  });

  useEffect(() => {
    const updateDiagnostics = () => {
      setDiagnostics({
        cpu: Math.floor(Math.random() * 30) + 20,
        memory: Math.floor(Math.random() * 40) + 30,
        disk: Math.floor(Math.random() * 20) + 60,
        network: Math.floor(Math.random() * 50) + 50,
        temperature: Math.floor(Math.random() * 20) + 35,
        uptime: Math.floor(Date.now() / 1000) % 86400,
      });
    };

    updateDiagnostics();
    const interval = setInterval(updateDiagnostics, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <motion.div
      className="fixed top-60 left-4 p-3 bg-black/30 backdrop-blur-md border border-yellow-500/30 rounded-lg z-40"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 2.5 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-4 h-4 text-yellow-400" />
        <span className="text-yellow-400 font-mono text-xs">DIAGNOSTICS</span>
      </div>
      <div className="space-y-1 text-xs font-mono">
        <div className="flex justify-between">
          <span className="text-gray-400">CPU:</span>
          <span className="text-green-400">{diagnostics.cpu}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Memory:</span>
          <span className="text-cyan-400">{diagnostics.memory}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Disk:</span>
          <span className="text-purple-400">{diagnostics.disk}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Network:</span>
          <span className="text-blue-400">{diagnostics.network}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Temp:</span>
          <span className="text-orange-400">{diagnostics.temperature}°C</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Uptime:</span>
          <span className="text-pink-400">{formatUptime(diagnostics.uptime)}</span>
        </div>
      </div>
    </motion.div>
  );
};

// Advanced Security Features Component
const AdvancedSecurity = () => {
  const [securityLevel, setSecurityLevel] = useState(85);
  const [activeThreats, setActiveThreats] = useState(0);
  const [encryptionStatus, setEncryptionStatus] = useState('AES-256');
  const [firewallStatus, setFirewallStatus] = useState('ACTIVE');

  useEffect(() => {
    const interval = setInterval(() => {
      setSecurityLevel(Math.floor(Math.random() * 20) + 80);
      setActiveThreats(Math.floor(Math.random() * 3));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed top-80 left-4 p-3 bg-black/30 backdrop-blur-md border border-red-500/30 rounded-lg z-40"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 3 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-4 h-4 text-red-400" />
        <span className="text-red-400 font-mono text-xs">SECURITY</span>
      </div>
      <div className="space-y-1 text-xs font-mono">
        <div className="flex justify-between">
          <span className="text-gray-400">Level:</span>
          <span className={securityLevel > 90 ? "text-green-400" : securityLevel > 70 ? "text-yellow-400" : "text-red-400"}>
            {securityLevel}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Threats:</span>
          <span className={activeThreats === 0 ? "text-green-400" : "text-red-400"}>
            {activeThreats}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Encryption:</span>
          <span className="text-cyan-400">{encryptionStatus}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Firewall:</span>
          <span className="text-green-400">{firewallStatus}</span>
        </div>
      </div>
    </motion.div>
  );
};

// Main Advanced Features Component
export const AdvancedFeatures = ({ onLogin }: { onLogin: (email: string) => void }) => {
  return (
    <div className="relative">
      {/* Device Detection */}
      <DeviceDetection />
      
      {/* Performance Monitor */}
      <PerformanceMonitor />
      
      {/* System Diagnostics */}
      <SystemDiagnostics />
      
      {/* Geolocation Tracker */}
      <GeolocationTracker />
      
      {/* Advanced Security */}
      <AdvancedSecurity />
      
      {/* Biometric Scanner */}
      <div className="fixed bottom-40 right-4 z-50">
        <BiometricScanner onSuccess={() => onLogin('biometric@example.com')} />
      </div>
    </div>
  );
};