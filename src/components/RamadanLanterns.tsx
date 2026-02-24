import { motion } from 'framer-motion';

const Lantern = ({
  delay = 0,
  x = 0,
  scale = 0.6,
  duration = 3,
  height = 20,
  className = ""
}: {
  delay?: number;
  x?: number | string;
  scale?: number;
  duration?: number;
  height?: number;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.5, delay, type: "spring", stiffness: 45, damping: 15 }}
      className={`absolute top-0 z-50 pointer-events-none origin-top ${className}`}
      style={{ left: x }}
    >
      <motion.div
        animate={{ rotate: [3.5, -3.5, 3.5] }}
        transition={{
          repeat: Infinity,
          duration: duration,
          ease: "easeInOut"
        }}
        className="flex flex-col items-center origin-top relative"
      >
        {/* Chain */}
        <div
          className="w-[2px] bg-gradient-to-b from-[#bfa356]/30 via-[#ffd453] to-[#8A6A2C] shadow-sm relative z-10"
          style={{ height: height }}
        />

        {/* Lantern Structure Container */}
        <div className="relative flex flex-col items-center" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>

          {/* Main SVG Lantern Skeleton */}
          <svg width="120" height="200" viewBox="0 0 120 200" className="relative z-10 filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.5)]">
            <defs>
              <linearGradient id="gold-main" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8A6A2C" />
                <stop offset="25%" stopColor="#D4AF37" />
                <stop offset="50%" stopColor="#FFF2CD" />
                <stop offset="75%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#6C531F" />
              </linearGradient>
              <linearGradient id="gold-dark" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#5C4615" />
                <stop offset="50%" stopColor="#A88722" />
                <stop offset="100%" stopColor="#5C4615" />
              </linearGradient>
              <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                <stop offset="50%" stopColor="rgba(255,212,83,0.15)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
              </linearGradient>
            </defs>

            {/* Top Crescent */}
            <path d="M60 5 C68 5, 75 12, 75 20 C75 16, 70 12, 65 12 C60 12, 55 16, 55 20 C55 12, 62 5, 60 5 Z" fill="url(#gold-main)" />
            <rect x="58" y="20" width="4" height="15" fill="url(#gold-main)" />

            {/* Top Dome */}
            <path d="M40 55 C40 35, 55 35, 60 35 C65 35, 80 35, 80 55 L85 65 L35 65 Z" fill="url(#gold-main)" />
            <path d="M30 65 L90 65 L85 75 L35 75 Z" fill="url(#gold-dark)" />

            {/* Inner Dark Background */}
            <rect x="35" y="75" width="50" height="85" fill="#0A1512" />

            {/* Geometric Windows Background Pattern */}
            <path d="M40 85 L48 75 L56 85 L48 95 Z M64 85 L72 75 L80 85 L72 95 Z M40 105 L48 95 L56 105 L48 115 Z M64 105 L72 95 L80 105 L72 115 Z M40 125 L48 115 L56 125 L48 135 Z M64 125 L72 115 L80 125 L72 135 Z M52 95 L60 85 L68 95 L60 105 Z M52 115 L60 105 L68 115 L60 125 Z M52 135 L60 125 L68 135 L60 145 Z" fill="none" stroke="url(#gold-main)" strokeWidth="1" opacity="0.3" />

            {/* Glass Cover */}
            <rect x="35" y="75" width="50" height="85" fill="url(#glass)" />

            {/* Vertical Supports */}
            <rect x="34" y="75" width="4" height="85" fill="url(#gold-main)" />
            <rect x="82" y="75" width="4" height="85" fill="url(#gold-main)" />
            <rect x="48" y="75" width="3" height="85" fill="url(#gold-dark)" opacity="0.9" />
            <rect x="69" y="75" width="3" height="85" fill="url(#gold-dark)" opacity="0.9" />

            {/* Base Tier 1 */}
            <path d="M35 160 L85 160 L95 175 L25 175 Z" fill="url(#gold-main)" />
            {/* Base Tier 2 */}
            <path d="M30 175 L90 175 L80 185 L40 185 Z" fill="url(#gold-dark)" />

            {/* Bottom Ring */}
            <circle cx="60" cy="188" r="4" fill="none" stroke="url(#gold-main)" strokeWidth="2" />
          </svg>

          {/* Glowing Center Inside (Animated via Framer Motion) */}
          <motion.div
            animate={{
              opacity: [0.6, 1, 0.7, 0.9, 0.5],
              scale: [0.95, 1.05, 0.98, 1.02, 0.9]
            }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="absolute top-[85px] w-12 h-16 rounded-full mix-blend-screen blur-[12px] z-20"
            style={{
              background: 'radial-gradient(circle, rgba(255,212,83,1) 0%, rgba(255,165,0,0.8) 40%, rgba(255,0,0,0) 80%)'
            }}
          />

          {/* Core Bright Light */}
          <motion.div
            animate={{ opacity: [0.7, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="absolute top-[105px] w-4 h-6 bg-white rounded-full blur-[4px] z-20 mix-blend-overlay"
          />

          {/* Huge Ambient Environment Glow */}
          <motion.div
            animate={{ opacity: [0.15, 0.25, 0.15], scale: [0.9, 1.1, 0.9] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute top-[110px] w-56 h-56 bg-[#ffd453] rounded-full blur-[70px] -z-10 pointer-events-none"
          />

          {/* Swinging Tassel */}
          <div className="absolute top-[192px] flex flex-col items-center origin-top relative z-10">
            <motion.div
              animate={{ rotate: [-8, 8, -8] }}
              transition={{ repeat: Infinity, duration: duration / 1.5, ease: "easeInOut" }}
              className="flex flex-col items-center origin-top border-t border-transparent"
            >
              <div className="w-[1.5px] h-3 bg-gradient-to-b from-[#D4AF37] to-[#8A6A2C]" />
              <div className="w-2.5 h-2.5 bg-gradient-to-br from-[#FFF2CD] to-[#8A6A2C] rounded-full shadow-sm" />
              <svg width="14" height="28" viewBox="0 0 14 28" className="mt-0.5 opacity-90 drop-shadow-md">
                <path d="M 7 0 L 14 28 L 0 28 Z" fill="#8A6A2C" />
                <path d="M 7 0 L 11 28 L 3 28 Z" fill="#D4AF37" />
                <line x1="2" y1="28" x2="2" y2="22" stroke="#FFF2CD" strokeWidth="0.5" opacity="0.6" />
                <line x1="4" y1="28" x2="4" y2="18" stroke="#FFF2CD" strokeWidth="0.5" opacity="0.6" />
                <line x1="6" y1="28" x2="6" y2="14" stroke="#FFF2CD" strokeWidth="0.5" opacity="0.6" />
                <line x1="8" y1="28" x2="8" y2="14" stroke="#FFF2CD" strokeWidth="0.5" opacity="0.6" />
                <line x1="10" y1="28" x2="10" y2="18" stroke="#FFF2CD" strokeWidth="0.5" opacity="0.6" />
                <line x1="12" y1="28" x2="12" y2="22" stroke="#FFF2CD" strokeWidth="0.5" opacity="0.6" />
              </svg>
            </motion.div>
          </div>

          {/* Floating light particles (Motes) */}
          <Particles />
        </div>
      </motion.div>
    </motion.div>
  );
};

const Particles = () => {
  return (
    <div className="absolute inset-x-0 -inset-y-10 z-20 pointer-events-none overflow-visible">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 0,
            y: Math.random() * 60 + 50,
            x: Math.random() * 80 - 40,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{
            opacity: [0, 0.8, 0],
            y: [null, Math.random() * 30 + 30],
            x: [null, Math.random() * 60 - 30],
          }}
          transition={{
            repeat: Infinity,
            duration: Math.random() * 2 + 2,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
          className="absolute w-1.5 h-1.5 bg-[#FFF2CD] rounded-full blur-[1px]"
          style={{
            boxShadow: "0 0 6px 2px rgba(255, 212, 83, 0.8)"
          }}
        />
      ))}
    </div>
  );
};

const DecorativeBranch = ({
  delay = 0,
  x = 0,
  scale = 0.6,
  flip = false,
  isMobile = false
}: {
  delay?: number;
  x?: number | string;
  scale?: number;
  flip?: boolean;
  isMobile?: boolean;
}) => {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.5, delay, type: "spring", stiffness: 45, damping: 15 }}
      className={`absolute top-0 z-40 pointer-events-none origin-top ${isMobile ? 'md:hidden' : 'hidden md:block'}`}
      style={{
        left: x,
        transform: `scale(${scale}) ${flip ? 'scaleX(-1)' : ''}`,
        transformOrigin: "top left"
      }}
    >
      <motion.div
        animate={{ rotate: [1, -1, 1], y: [0, 5, 0] }}
        transition={{
          repeat: Infinity,
          duration: 6,
          ease: "easeInOut",
          delay: delay
        }}
        className="relative origin-top-left"
      >
        <svg width="300" height="120" viewBox="0 0 300 120" className="filter drop-shadow-[0_5px_8px_rgba(0,0,0,0.3)]">
          {/* The Main Drooping String */}
          <path
            d="M 0 0 Q 150 120 300 0"
            fill="none"
            stroke="#8A6A2C"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />

          {/* Flag 1: Red */}
          <g transform={`translate(${isMobile ? 100 : 70}, ${isMobile ? 60 : 40})`}>
            <motion.g animate={{ rotate: [2, -2, 2] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.1 }} style={{ transformOrigin: "top center" }}>
              <path d="M 0 0 L 15 35 L 30 0 Z" fill="#E63946" stroke="#ffd453" strokeWidth="1" />
            </motion.g>
          </g>

          {/* Flag 2: Yellow/Gold */}
          <g transform={`translate(${isMobile ? 200 : 150}, ${isMobile ? 40 : 60})`}>
            <motion.g animate={{ rotate: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.3 }} style={{ transformOrigin: "top center" }}>
              <path d="M 0 0 L 15 35 L 30 0 Z" fill="#F4A261" stroke="#ffd453" strokeWidth="1" />
            </motion.g>
          </g>

          {!isMobile && (
            <>
              {/* Flag 3: Green */}
              <g transform="translate(230, 40)">
                <motion.g animate={{ rotate: [2, -2, 2] }} transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut", delay: 0.5 }} style={{ transformOrigin: "top center" }}>
                  <path d="M 0 0 L 15 35 L 30 0 Z" fill="#2A9D8F" stroke="#ffd453" strokeWidth="1" />
                </motion.g>
              </g>
            </>
          )}
        </svg>
      </motion.div>
    </motion.div>
  );
};

const RamadanLanterns = () => {
  return (
    <div className="fixed top-[64px] md:top-[80px] left-0 w-full h-0 z-[45] pointer-events-none overflow-visible">
      {/* Branches Layer - Handling Mobile vs Desktop distribution */}
      <div className="w-full relative h-0">
        {/* Mobile Branches (Positioned at corners + one in the center for better organization) */}
        <DecorativeBranch x="-2%" delay={0.1} scale={0.18} isMobile />
        <DecorativeBranch x="45%" delay={0.5} scale={0.15} isMobile /> {/* Shifted right as requested */}
        <DecorativeBranch x="102%" delay={0.3} scale={0.18} isMobile flip />

        {/* Desktop Branches (Full) */}
        <DecorativeBranch x="-5%" delay={0.1} scale={0.15} />
        <DecorativeBranch x="20%" delay={0.3} scale={0.2} />
        <DecorativeBranch x="45%" delay={0.5} scale={0.25} />
        <DecorativeBranch x="75%" delay={0.2} scale={0.15} />
        <DecorativeBranch x="90%" delay={0.4} scale={0.2} flip />
      </div>

      {/* Lanterns Layer */}
      <div className="w-full relative h-0">
        {/* Right side */}
        <Lantern x="88%" delay={0.2} scale={0.45} height={15} duration={3.5} />
        <Lantern x="70%" delay={0.8} scale={0.4} height={35} duration={4.2} />

        {/* Center */}
        <Lantern x="50%" delay={1.8} scale={0.3} height={20} duration={5.5} className="hidden lg:block" />
        <Lantern x="35%" delay={0.9} scale={0.35} height={40} duration={4.8} className="hidden md:block" />

        {/* Left side */}
        <Lantern x="12%" delay={0.6} scale={0.4} height={25} duration={4.5} />
      </div>
    </div>
  );
};

export default RamadanLanterns;
