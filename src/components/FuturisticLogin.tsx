import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Shield, 
  Fingerprint, 
  Smartphone,
  Github,
  Chrome,
  Twitter,
  Globe,
  Clock,
  Volume2,
  VolumeX,
  QrCode,
  UserCheck,
  Settings,
  Zap,
  Star,
  Sparkles,
  Rocket,
  Cpu,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Validation schemas
const loginSchema = yup.object({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const registerSchema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain uppercase letter')
    .matches(/[a-z]/, 'Password must contain lowercase letter')
    .matches(/[0-9]/, 'Password must contain number')
    .matches(/[^A-Za-z0-9]/, 'Password must contain special character')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

// 3D Planet Component
const Planet = ({ mousePosition }: { mousePosition: { x: number; y: number } }) => {
  const meshRef = useRef<any>();

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = mousePosition.y * 0.0005;
      meshRef.current.rotation.y = mousePosition.x * 0.0005;
    }
  }, [mousePosition]);

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        color="#4f46e5" 
        emissive="#1e1b4b" 
        emissiveIntensity={0.2}
        roughness={0.7}
        metalness={0.3}
      />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
    </mesh>
  );
};

// Particle System Component
const ParticleField = ({ mousePosition }: { mousePosition: { x: number; y: number } }) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; vx: number; vy: number; size: number; opacity: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + particle.vx + window.innerWidth) % window.innerWidth,
        y: (particle.y + particle.vy + window.innerHeight) % window.innerHeight,
      })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-cyan-400"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 2}px rgba(34, 211, 238, 0.6)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [particle.opacity, particle.opacity * 0.5, particle.opacity],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Sci-fi Input Component
const FuturisticInput = ({ 
  icon: Icon, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  error, 
  name,
  onFocus,
  onBlur,
  ...props 
}: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative group">
      <motion.div
        className={cn(
          "relative flex items-center bg-black/20 backdrop-blur-md border rounded-lg transition-all duration-300",
          isFocused ? "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]" : "border-purple-500/30",
          error ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]" : ""
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Icon className={cn(
          "w-5 h-5 ml-4 transition-colors duration-300",
          isFocused ? "text-cyan-400" : "text-purple-400",
          error ? "text-red-400" : ""
        )} />
        <input
          type={type === "password" && showPassword ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          name={name}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          className="w-full px-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none font-mono"
          style={{ fontFamily: 'Orbitron, monospace' }}
          {...props}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="mr-4 text-purple-400 hover:text-cyan-400 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </motion.div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm mt-1 font-mono"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

// Password Strength Indicator
const PasswordStrength = ({ password }: { password: string }) => {
  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="h-1 flex-1 rounded-full bg-gray-700"
            animate={{
              backgroundColor: i < strength ? strengthColors[strength - 1] : '#374151',
              boxShadow: i < strength ? `0 0 10px ${strengthColors[strength - 1]}` : 'none',
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
      <p className="text-xs font-mono" style={{ color: strengthColors[strength - 1] || '#9ca3af' }}>
        {password ? strengthLabels[strength - 1] || 'Very Weak' : 'Enter password'}
      </p>
    </div>
  );
};

// Biometric Auth Component
const BiometricAuth = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleBiometricAuth = async () => {
    if (!('credentials' in navigator)) {
      toast.error('Biometric authentication not supported');
      return;
    }

    setIsScanning(true);
    try {
      // Simulate biometric authentication
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Biometric authentication successful!');
      onSuccess();
    } catch (error) {
      toast.error('Biometric authentication failed');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleBiometricAuth}
      disabled={isScanning}
      className="relative p-4 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 backdrop-blur-md border border-purple-500/30 rounded-lg hover:border-cyan-400/50 transition-all duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={isScanning ? { rotate: 360 } : {}}
        transition={{ duration: 2, repeat: isScanning ? Infinity : 0 }}
      >
        <Fingerprint className="w-8 h-8 text-cyan-400 mx-auto" />
      </motion.div>
      <p className="text-xs text-gray-300 mt-2 font-mono">
        {isScanning ? 'Scanning...' : 'Biometric Login'}
      </p>
    </motion.button>
  );
};

// QR Code Login Component
const QRCodeLogin = () => {
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    // Generate QR code data
    const qrData = `https://iconic-login.app/qr/${Math.random().toString(36).substr(2, 9)}`;
    setQrCode(qrData);
  }, []);

  return (
    <motion.div
      className="p-4 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 backdrop-blur-md border border-purple-500/30 rounded-lg"
      whileHover={{ scale: 1.05 }}
    >
      <QrCode className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
      <div className="w-20 h-20 bg-white/10 rounded border-2 border-dashed border-cyan-400/50 flex items-center justify-center mx-auto">
        <span className="text-xs text-gray-400 font-mono">QR</span>
      </div>
      <p className="text-xs text-gray-300 mt-2 font-mono text-center">Scan to Login</p>
    </motion.div>
  );
};

// AI Assistant Component
const AIAssistant = () => {
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  const aiResponses = [
    "Welcome to the Iconic Portal, traveler.",
    "Need help accessing your account?",
    "Your credentials are secured with quantum encryption.",
    "Biometric authentication is available for enhanced security.",
    "Remember to enable two-factor authentication for maximum protection.",
  ];

  const handleAIClick = () => {
    setIsActive(!isActive);
    if (!isActive) {
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      setMessages([randomResponse]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="mb-4 p-4 bg-black/80 backdrop-blur-md border border-cyan-400/30 rounded-lg max-w-xs"
          >
            {messages.map((message, index) => (
              <p key={index} className="text-cyan-400 text-sm font-mono">{message}</p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={handleAIClick}
        className="w-16 h-16 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full flex items-center justify-center shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: [
            '0 0 20px rgba(34, 211, 238, 0.5)',
            '0 0 40px rgba(147, 51, 234, 0.5)',
            '0 0 20px rgba(34, 211, 238, 0.5)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Cpu className="w-8 h-8 text-white" />
      </motion.button>
    </div>
  );
};

// Status Bar Component
const StatusBar = () => {
  const [time, setTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [signalStrength, setSignalStrength] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate battery and signal changes
    const interval = setInterval(() => {
      setBatteryLevel(Math.floor(Math.random() * 30) + 70);
      setSignalStrength(Math.floor(Math.random() * 2) + 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-4 right-4 flex items-center gap-4 text-cyan-400 font-mono text-sm z-50">
      <div className="flex items-center gap-1">
        <Clock className="w-4 h-4" />
        <span>{time.toLocaleTimeString()}</span>
      </div>
      <div className="flex items-center gap-1">
        <Signal className="w-4 h-4" />
        <span>{signalStrength}/4</span>
      </div>
      <div className="flex items-center gap-1">
        <Battery className="w-4 h-4" />
        <span>{batteryLevel}%</span>
      </div>
      <div className="flex items-center gap-1">
        <Wifi className="w-4 h-4" />
        <span>SECURE</span>
      </div>
    </div>
  );
};

// Main Login Component
export const FuturisticLogin = ({ onLogin }: { onLogin: (email: string) => void }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'mfa'>('login');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState('en');
  const [guestMode, setGuestMode] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(1800); // 30 minutes
  const audioRef = useRef<HTMLAudioElement>(null);

  // Form handling
  const loginForm = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const registerForm = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' }
  });

  // Mouse tracking for 3D effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Session timer
  useEffect(() => {
    if (mode === 'login') {
      const timer = setInterval(() => {
        setSessionTimer(prev => prev > 0 ? prev - 1 : 0);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode]);

  // Sound effects
  const playSound = (type: 'click' | 'success' | 'error' | 'hover') => {
    if (!soundEnabled) return;
    
    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'click':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        break;
      case 'success':
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
        break;
      case 'error':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        break;
      case 'hover':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        break;
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  // Handle login submission
  const handleLogin = async (data: any) => {
    setIsLoading(true);
    playSound('click');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check demo accounts
      const demoAccounts = {
        'imamkabir397@gmail.com': { password: '1234567890', role: 'super_admin' },
        'imamkabir63@gmail.com': { password: '1234', role: 'user' },
        'admin@iconic.com': { password: 'admin123', role: 'admin' },
        'lecturer@iconic.com': { password: 'lecturer123', role: 'lecturer' },
      };

      const account = demoAccounts[data.email as keyof typeof demoAccounts];
      
      if (account && account.password === data.password) {
        playSound('success');
        toast.success('🚀 Welcome to the Iconic Portal!', {
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#22d3ee',
            border: '1px solid #06b6d4',
          },
        });
        
        // Store auth data
        localStorage.setItem('userRole', account.role);
        localStorage.setItem('authToken', 'demo-token-' + account.role);
        
        setTimeout(() => onLogin(data.email), 1000);
      } else {
        // Check if MFA is required
        if (data.email.includes('mfa')) {
          setShowMFA(true);
          setMode('mfa');
          toast('🔐 Multi-factor authentication required', {
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#a855f7',
              border: '1px solid #9333ea',
            },
          });
        } else {
          playSound('error');
          toast.error('❌ Invalid credentials');
        }
      }
    } catch (error) {
      playSound('error');
      toast.error('🛸 Connection to mothership failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (data: any) => {
    setIsLoading(true);
    playSound('click');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      playSound('success');
      toast.success('🎉 Account created successfully!');
      setMode('login');
    } catch (error) {
      playSound('error');
      toast.error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle MFA verification
  const handleMFAVerification = async () => {
    if (mfaCode.length !== 6) {
      toast.error('Please enter 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      playSound('success');
      toast.success('🔓 MFA verification successful!');
      onLogin('mfa@example.com');
    } catch (error) {
      playSound('error');
      toast.error('Invalid MFA code');
    } finally {
      setIsLoading(false);
    }
  };

  // Social login handlers
  const handleSocialLogin = (provider: string) => {
    playSound('click');
    toast(`🌐 Connecting to ${provider}...`, {
      style: {
        background: 'rgba(0, 0, 0, 0.8)',
        color: '#22d3ee',
        border: '1px solid #06b6d4',
      },
    });
  };

  // Guest mode
  const handleGuestMode = () => {
    setGuestMode(true);
    playSound('success');
    toast.success('👽 Entering guest mode...');
    setTimeout(() => onLogin('guest@iconic.com'), 1000);
  };

  // Format session timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Sci-fi quotes
  const quotes = [
    "The stars await your login",
    "Access the digital cosmos",
    "Your journey begins here",
    "Welcome to the future",
    "Connecting to the matrix...",
  ];

  const [currentQuote, setCurrentQuote] = useState(quotes[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Planet mousePosition={mousePosition} />
          <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        </Canvas>
      </div>

      {/* Particle Effects */}
      <ParticleField mousePosition={mousePosition} />

      {/* Status Bar */}
      <StatusBar />

      {/* Nebula Glow Effect */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-500/20 via-transparent to-transparent animate-pulse" />

      {/* Wave Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyan-500/20 to-transparent">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-cyan-500/30"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="w-full max-w-md"
        >
          {/* Logo and Title */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              🌌
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-mono">
              ICONIC PORTAL
            </h1>
            <motion.p
              className="text-gray-400 mt-2 font-mono text-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {currentQuote}
            </motion.p>
          </motion.div>

          {/* Main Login Panel */}
          <motion.div
            className="bg-black/30 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 shadow-2xl"
            style={{
              boxShadow: '0 0 50px rgba(147, 51, 234, 0.3), inset 0 0 50px rgba(34, 211, 238, 0.1)',
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {/* Mode Tabs */}
            <div className="flex mb-6 bg-black/20 rounded-lg p-1">
              {['login', 'register'].map((tabMode) => (
                <motion.button
                  key={tabMode}
                  onClick={() => {
                    setMode(tabMode as any);
                    playSound('hover');
                  }}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-md font-mono text-sm transition-all duration-300",
                    mode === tabMode
                      ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg"
                      : "text-gray-400 hover:text-white"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tabMode.charAt(0).toUpperCase() + tabMode.slice(1)}
                </motion.button>
              ))}
            </div>

            {/* Login Form */}
            {mode === 'login' && (
              <motion.form
                onSubmit={loginForm.handleSubmit(handleLogin)}
                className="space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <FuturisticInput
                  icon={Mail}
                  type="email"
                  placeholder="Enter your email"
                  {...loginForm.register('email')}
                  error={loginForm.formState.errors.email?.message}
                />

                <FuturisticInput
                  icon={Lock}
                  type="password"
                  placeholder="Enter your password"
                  {...loginForm.register('password')}
                  error={loginForm.formState.errors.password?.message}
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-gray-400 font-mono text-sm">
                    <input type="checkbox" className="rounded bg-black/20 border-purple-500/30" />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-cyan-400 hover:text-cyan-300 font-mono text-sm transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-mono font-bold rounded-lg relative overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={() => playSound('hover')}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-20"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                  {isLoading ? (
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Rocket className="w-5 h-5 animate-spin" />
                      ACCESSING PORTAL...
                    </motion.div>
                  ) : (
                    'INITIATE LOGIN SEQUENCE'
                  )}
                </motion.button>
              </motion.form>
            )}

            {/* Register Form */}
            {mode === 'register' && (
              <motion.form
                onSubmit={registerForm.handleSubmit(handleRegister)}
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <FuturisticInput
                  icon={User}
                  placeholder="Enter your name"
                  {...registerForm.register('name')}
                  error={registerForm.formState.errors.name?.message}
                />

                <FuturisticInput
                  icon={Mail}
                  type="email"
                  placeholder="Enter your email"
                  {...registerForm.register('email')}
                  error={registerForm.formState.errors.email?.message}
                />

                <div>
                  <FuturisticInput
                    icon={Lock}
                    type="password"
                    placeholder="Create password"
                    {...registerForm.register('password')}
                    error={registerForm.formState.errors.password?.message}
                  />
                  <PasswordStrength password={registerForm.watch('password') || ''} />
                </div>

                <FuturisticInput
                  icon={Shield}
                  type="password"
                  placeholder="Confirm password"
                  {...registerForm.register('confirmPassword')}
                  error={registerForm.formState.errors.confirmPassword?.message}
                />

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-mono font-bold rounded-lg relative overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={() => playSound('hover')}
                >
                  {isLoading ? (
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Star className="w-5 h-5 animate-spin" />
                      CREATING ACCOUNT...
                    </motion.div>
                  ) : (
                    'CREATE COSMIC ACCOUNT'
                  )}
                </motion.button>
              </motion.form>
            )}

            {/* MFA Form */}
            {mode === 'mfa' && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center">
                  <Shield className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                  <h3 className="text-xl font-mono text-white mb-2">Multi-Factor Authentication</h3>
                  <p className="text-gray-400 font-mono text-sm">Enter the 6-digit code sent to your device</p>
                </div>

                <div className="flex gap-2 justify-center">
                  {[...Array(6)].map((_, i) => (
                    <motion.input
                      key={i}
                      type="text"
                      maxLength={1}
                      className="w-12 h-12 bg-black/20 border border-purple-500/30 rounded-lg text-center text-white font-mono text-lg focus:border-cyan-400 focus:outline-none"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value && i < 5) {
                          const nextInput = e.target.parentElement?.children[i + 1] as HTMLInputElement;
                          nextInput?.focus();
                        }
                        const newCode = mfaCode.split('');
                        newCode[i] = value;
                        setMfaCode(newCode.join(''));
                      }}
                      whileFocus={{ scale: 1.1, borderColor: '#22d3ee' }}
                    />
                  ))}
                </div>

                <motion.button
                  onClick={handleMFAVerification}
                  disabled={isLoading || mfaCode.length !== 6}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-mono font-bold rounded-lg disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? 'VERIFYING...' : 'VERIFY IDENTITY'}
                </motion.button>
              </motion.div>
            )}

            {/* Forgot Password Form */}
            {mode === 'forgot' && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center">
                  <Mail className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                  <h3 className="text-xl font-mono text-white mb-2">Reset Password</h3>
                  <p className="text-gray-400 font-mono text-sm">Enter your email to receive reset instructions</p>
                </div>

                <FuturisticInput
                  icon={Mail}
                  type="email"
                  placeholder="Enter your email"
                />

                <motion.button
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-mono font-bold rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    toast.success('🚀 Reset link sent to your email!');
                    setMode('login');
                  }}
                >
                  SEND RESET SIGNAL
                </motion.button>

                <button
                  onClick={() => setMode('login')}
                  className="w-full text-cyan-400 hover:text-cyan-300 font-mono text-sm transition-colors"
                >
                  ← Back to Login
                </button>
              </motion.div>
            )}

            {/* Social Login Options */}
            {(mode === 'login' || mode === 'register') && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-purple-500/30" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-black/50 text-gray-400 font-mono">OR CONNECT WITH</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6">
                  {[
                    { name: 'Google', icon: Chrome, color: 'from-red-500 to-yellow-500' },
                    { name: 'GitHub', icon: Github, color: 'from-gray-600 to-gray-800' },
                    { name: 'Twitter', icon: Twitter, color: 'from-blue-400 to-blue-600' },
                  ].map((provider) => (
                    <motion.button
                      key={provider.name}
                      onClick={() => handleSocialLogin(provider.name)}
                      className={cn(
                        "p-3 bg-gradient-to-r backdrop-blur-md border border-purple-500/30 rounded-lg hover:border-cyan-400/50 transition-all duration-300",
                        provider.color
                      )}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onMouseEnter={() => playSound('hover')}
                    >
                      <provider.icon className="w-6 h-6 text-white mx-auto" />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Alternative Auth Methods */}
            {mode === 'login' && (
              <div className="mt-6 grid grid-cols-2 gap-4">
                <BiometricAuth onSuccess={() => onLogin('biometric@example.com')} />
                <QRCodeLogin />
              </div>
            )}

            {/* Guest Mode */}
            <motion.button
              onClick={handleGuestMode}
              className="w-full mt-4 py-2 text-gray-400 hover:text-cyan-400 font-mono text-sm border border-gray-600/30 rounded-lg hover:border-cyan-400/50 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              onMouseEnter={() => playSound('hover')}
            >
              👽 Enter as Guest Explorer
            </motion.button>

            {/* Session Timer */}
            {sessionTimer > 0 && (
              <div className="mt-4 text-center">
                <p className="text-gray-500 font-mono text-xs">
                  Session expires in: {formatTime(sessionTimer)}
                </p>
              </div>
            )}
          </motion.div>

          {/* Control Panel */}
          <motion.div
            className="mt-6 flex justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 bg-black/30 backdrop-blur-md border border-purple-500/30 rounded-lg hover:border-cyan-400/50 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-cyan-400" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
            </motion.button>

            <motion.button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 bg-black/30 backdrop-blur-md border border-purple-500/30 rounded-lg hover:border-cyan-400/50 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Sparkles className="w-5 h-5 text-purple-400" />
            </motion.button>

            <motion.button
              className="p-2 bg-black/30 backdrop-blur-md border border-purple-500/30 rounded-lg hover:border-cyan-400/50 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </motion.button>
          </motion.div>

          {/* Demo Credentials */}
          <motion.div
            className="mt-6 p-4 bg-black/20 backdrop-blur-md border border-cyan-400/20 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <h4 className="text-cyan-400 font-mono text-sm mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              DEMO ACCESS CODES
            </h4>
            <div className="space-y-1 text-xs font-mono text-gray-400">
              <p>🌟 Super Admin: imamkabir397@gmail.com / 1234567890</p>
              <p>👤 User: imamkabir63@gmail.com / 1234</p>
              <p>🔐 MFA Demo: mfa@example.com / any password</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* AI Assistant */}
      <AIAssistant />

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#22d3ee',
            border: '1px solid #06b6d4',
            fontFamily: 'monospace',
          },
        }}
      />

      {/* Background Audio */}
      <audio ref={audioRef} loop>
        <source src="/ambient-space.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
};