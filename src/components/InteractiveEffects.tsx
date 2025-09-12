import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// Custom Cursor Component
export const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-50 mix-blend-difference"
      style={{
        translateX: cursorXSpring,
        translateY: cursorYSpring,
      }}
    >
      <div className="w-full h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full opacity-80 blur-sm" />
      <div className="absolute inset-2 bg-white rounded-full" />
    </motion.div>
  );
};

// Ripple Effect Component
export const RippleEffect = ({ children, ...props }: any) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const addRipple = useCallback((event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  }, []);

  return (
    <div
      className="relative overflow-hidden"
      onMouseDown={addRipple}
      {...props}
    >
      {children}
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute bg-cyan-400/30 rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
          }}
          initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
          animate={{ width: 100, height: 100, opacity: [0.5, 0] }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
};

// Holographic Effect Component
export const HolographicPanel = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Holographic border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-lg blur-sm" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-lg" />
      
      {/* Scanning line effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent h-1"
        animate={{
          y: ['-100%', '100%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Content */}
      <div className="relative bg-black/30 backdrop-blur-xl border border-purple-500/30 rounded-lg">
        {children}
      </div>
    </motion.div>
  );
};

// Particle Burst Effect
export const ParticleBurst = ({ trigger, position }: { trigger: boolean; position: { x: number; y: number } }) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; vx: number; vy: number }>>([]);

  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: Date.now() + i,
        x: position.x,
        y: position.y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
      }));

      setParticles(newParticles);

      setTimeout(() => {
        setParticles([]);
      }, 1000);
    }
  }, [trigger, position]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 bg-cyan-400 rounded-full"
          initial={{ x: particle.x, y: particle.y, opacity: 1 }}
          animate={{
            x: particle.x + particle.vx * 50,
            y: particle.y + particle.vy * 50,
            opacity: 0,
            scale: [1, 0],
          }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
};

// Glitch Effect Component
export const GlitchText = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 200);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className={`relative ${className}`}
      animate={isGlitching ? {
        x: [0, -2, 2, -1, 1, 0],
        filter: [
          'hue-rotate(0deg)',
          'hue-rotate(90deg)',
          'hue-rotate(180deg)',
          'hue-rotate(270deg)',
          'hue-rotate(0deg)',
        ],
      } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
      {isGlitching && (
        <>
          <div className="absolute inset-0 text-red-400 opacity-70" style={{ transform: 'translate(-2px, 0)' }}>
            {children}
          </div>
          <div className="absolute inset-0 text-cyan-400 opacity-70" style={{ transform: 'translate(2px, 0)' }}>
            {children}
          </div>
        </>
      )}
    </motion.div>
  );
};

// Matrix Rain Effect
export const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff00';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 opacity-10 pointer-events-none z-0"
    />
  );
};

// Electromagnetic Field Visualization
export const EMField = ({ mousePosition }: { mousePosition: { x: number; y: number } }) => {
  const [fieldLines, setFieldLines] = useState<Array<{ id: number; x1: number; y1: number; x2: number; y2: number }>>([]);

  useEffect(() => {
    const generateFieldLines = () => {
      const lines = [];
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const distance = 200;
        const x1 = centerX + Math.cos(angle) * distance;
        const y1 = centerY + Math.sin(angle) * distance;
        const x2 = centerX + Math.cos(angle) * (distance + 100);
        const y2 = centerY + Math.sin(angle) * (distance + 100);

        lines.push({ id: i, x1, y1, x2, y2 });
      }

      setFieldLines(lines);
    };

    generateFieldLines();
    window.addEventListener('resize', generateFieldLines);
    return () => window.removeEventListener('resize', generateFieldLines);
  }, []);

  return (
    <svg className="fixed inset-0 pointer-events-none z-5 opacity-20">
      {fieldLines.map(line => (
        <motion.line
          key={line.id}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="url(#fieldGradient)"
          strokeWidth="1"
          animate={{
            opacity: [0.2, 0.8, 0.2],
            strokeWidth: [1, 2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: line.id * 0.1,
          }}
        />
      ))}
      <defs>
        <linearGradient id="fieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// Quantum Entanglement Visualization
export const QuantumEntanglement = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; connected: number[] }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      connected: [Math.floor(Math.random() * 10)],
    }));

    setParticles(newParticles);
  }, []);

  return (
    <svg className="fixed inset-0 pointer-events-none z-5 opacity-30">
      {particles.map(particle => (
        <g key={particle.id}>
          <motion.circle
            cx={particle.x}
            cy={particle.y}
            r="3"
            fill="#22d3ee"
            animate={{
              opacity: [0.3, 1, 0.3],
              r: [2, 4, 2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: particle.id * 0.2,
            }}
          />
          {particle.connected.map(connectedId => {
            const connectedParticle = particles[connectedId];
            if (!connectedParticle) return null;
            
            return (
              <motion.line
                key={`${particle.id}-${connectedId}`}
                x1={particle.x}
                y1={particle.y}
                x2={connectedParticle.x}
                y2={connectedParticle.y}
                stroke="#a855f7"
                strokeWidth="1"
                opacity="0.3"
                animate={{
                  opacity: [0.1, 0.5, 0.1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: particle.id * 0.1,
                }}
              />
            );
          })}
        </g>
      ))}
    </svg>
  );
};

// Neural Network Visualization
export const NeuralNetwork = () => {
  const [nodes, setNodes] = useState<Array<{ id: number; x: number; y: number; layer: number; active: boolean }>>([]);
  const [connections, setConnections] = useState<Array<{ from: number; to: number; weight: number }>>([]);

  useEffect(() => {
    const layers = 4;
    const nodesPerLayer = 6;
    const newNodes = [];
    const newConnections = [];

    // Create nodes
    for (let layer = 0; layer < layers; layer++) {
      for (let node = 0; node < nodesPerLayer; node++) {
        newNodes.push({
          id: layer * nodesPerLayer + node,
          x: (window.innerWidth / (layers + 1)) * (layer + 1),
          y: (window.innerHeight / (nodesPerLayer + 1)) * (node + 1),
          layer,
          active: Math.random() > 0.5,
        });
      }
    }

    // Create connections
    for (let layer = 0; layer < layers - 1; layer++) {
      for (let from = 0; from < nodesPerLayer; from++) {
        for (let to = 0; to < nodesPerLayer; to++) {
          if (Math.random() > 0.3) { // 70% connection probability
            newConnections.push({
              from: layer * nodesPerLayer + from,
              to: (layer + 1) * nodesPerLayer + to,
              weight: Math.random(),
            });
          }
        }
      }
    }

    setNodes(newNodes);
    setConnections(newConnections);

    // Animate neural activity
    const interval = setInterval(() => {
      setNodes(prev => prev.map(node => ({
        ...node,
        active: Math.random() > 0.7,
      })));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <svg className="fixed inset-0 pointer-events-none z-5 opacity-15">
      {/* Connections */}
      {connections.map((conn, index) => {
        const fromNode = nodes[conn.from];
        const toNode = nodes[conn.to];
        if (!fromNode || !toNode) return null;

        return (
          <motion.line
            key={index}
            x1={fromNode.x}
            y1={fromNode.y}
            x2={toNode.x}
            y2={toNode.y}
            stroke="#6366f1"
            strokeWidth={conn.weight * 2}
            animate={{
              opacity: [0.1, conn.weight, 0.1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.05,
            }}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map(node => (
        <motion.circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r="4"
          fill={node.active ? "#22d3ee" : "#6b7280"}
          animate={{
            r: node.active ? [4, 6, 4] : 4,
            opacity: node.active ? [0.5, 1, 0.5] : 0.3,
          }}
          transition={{
            duration: 1,
            repeat: node.active ? Infinity : 0,
          }}
        />
      ))}
    </svg>
  );
};

// Data Stream Visualization
export const DataStream = () => {
  const [streams, setStreams] = useState<Array<{ id: number; data: string[]; speed: number }>>([]);

  useEffect(() => {
    const dataTypes = ['USER_AUTH', 'ENCRYPT', 'VALIDATE', 'SECURE', 'VERIFY', 'TOKEN', 'HASH', 'SIGN'];
    
    const newStreams = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      data: Array.from({ length: 20 }, () => dataTypes[Math.floor(Math.random() * dataTypes.length)]),
      speed: Math.random() * 2 + 1,
    }));

    setStreams(newStreams);

    const interval = setInterval(() => {
      setStreams(prev => prev.map(stream => ({
        ...stream,
        data: [
          ...stream.data.slice(1),
          dataTypes[Math.floor(Math.random() * dataTypes.length)],
        ],
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-5 opacity-20">
      {streams.map(stream => (
        <div
          key={stream.id}
          className="absolute top-0 font-mono text-xs text-green-400"
          style={{ left: `${20 + stream.id * 15}%` }}
        >
          {stream.data.map((data, index) => (
            <motion.div
              key={`${stream.id}-${index}`}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: window.innerHeight + 20, opacity: [0, 1, 0] }}
              transition={{
                duration: 10 / stream.speed,
                delay: index * 0.5,
                repeat: Infinity,
              }}
              className="mb-4"
            >
              {data}
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Electromagnetic Pulse Effect
export const EMPulse = ({ trigger }: { trigger: boolean }) => {
  return (
    <AnimatePresence>
      {trigger && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 border-2 border-cyan-400 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ width: 0, height: 0, opacity: 1 }}
              animate={{
                width: window.innerWidth * 2,
                height: window.innerWidth * 2,
                opacity: 0,
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                ease: 'easeOut',
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Cyberpunk Grid
export const CyberpunkGrid = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#22d3ee" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
};

// Holographic Keyboard
export const HolographicKeyboard = ({ onKeyPress }: { onKeyPress: (key: string) => void }) => {
  const keys = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];

  return (
    <motion.div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 3 }}
    >
      <div className="bg-black/30 backdrop-blur-md border border-cyan-400/30 rounded-lg p-4">
        <div className="space-y-2">
          {keys.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 justify-center">
              {row.map((key) => (
                <motion.button
                  key={key}
                  onClick={() => onKeyPress(key)}
                  className="w-8 h-8 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 rounded text-cyan-400 font-mono text-xs hover:border-cyan-400/50 transition-all duration-300"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {key}
                </motion.button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};