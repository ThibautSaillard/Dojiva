import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type MascotMood = "bullish" | "bearish" | "neutral" | "happy" | "sad" | "surprised";

interface CandleMascotProps {
  mood?: MascotMood;
  className?: string;
  size?: number;
  animate?: boolean;
}

export function CandleMascot({ mood = "bullish", className, size = 120, animate = true }: CandleMascotProps) {
  const isGreen = mood === "bullish" || mood === "happy";
  const isRed = mood === "bearish" || mood === "sad" || mood === "surprised";
  const color = isGreen ? "#58cc02" : isRed ? "#ff4b4b" : "#ffc800";
  const shadowColor = isGreen ? "#46a302" : isRed ? "#ea2b2b" : "#e5b400";
  
  // Wick positions and body height
  const wickTop = isGreen ? 10 : 30;
  const wickBottom = isGreen ? 110 : 90;
  const bodyTop = isGreen ? 30 : 20;
  const bodyHeight = 60;

  // Eyes and Mouth based on mood
  let eyes = (
    <>
      <ellipse cx="40" cy="55" rx="5" ry="7" fill="black" />
      <ellipse cx="60" cy="55" rx="5" ry="7" fill="black" />
      <circle cx="42" cy="52" r="2" fill="white" />
      <circle cx="62" cy="52" r="2" fill="white" />
    </>
  );

  let mouth = <path d="M 45 65 Q 50 72 55 65" stroke="black" strokeWidth="3" fill="transparent" strokeLinecap="round" />;

  if (mood === "sad" || mood === "bearish") {
    mouth = <path d="M 45 70 Q 50 65 55 70" stroke="black" strokeWidth="3" fill="transparent" strokeLinecap="round" />;
    eyes = (
      <>
        <ellipse cx="40" cy="58" rx="5" ry="5" fill="black" />
        <ellipse cx="60" cy="58" rx="5" ry="5" fill="black" />
        <path d="M 35 50 Q 40 55 45 52" stroke="black" strokeWidth="2" fill="transparent" />
        <path d="M 55 52 Q 60 55 65 50" stroke="black" strokeWidth="2" fill="transparent" />
      </>
    );
  } else if (mood === "surprised") {
    mouth = <circle cx="50" cy="68" r="4" fill="black" />;
    eyes = (
      <>
        <circle cx="40" cy="53" r="6" fill="black" />
        <circle cx="60" cy="53" r="6" fill="black" />
        <circle cx="40" cy="53" r="2" fill="white" />
        <circle cx="60" cy="53" r="2" fill="white" />
      </>
    );
  } else if (mood === "happy") {
    mouth = <path d="M 42 65 Q 50 75 58 65" stroke="black" strokeWidth="3" fill="transparent" strokeLinecap="round" />;
    eyes = (
      <>
        <path d="M 35 55 Q 40 48 45 55" stroke="black" strokeWidth="3" fill="transparent" strokeLinecap="round" />
        <path d="M 55 55 Q 60 48 65 55" stroke="black" strokeWidth="3" fill="transparent" strokeLinecap="round" />
      </>
    );
  }

  return (
    <motion.div
      className={cn("relative inline-block", className)}
      style={{ width: size, height: size * 1.2 }}
      animate={
        animate
          ? {
              y: [0, -10, 0],
            }
          : {}
      }
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 100 120" className="overflow-visible">
        {/* Upper Wick */}
        <line x1="50" y1={wickTop} x2="50" y2={bodyTop} stroke="#333" strokeWidth="6" strokeLinecap="round" />
        
        {/* Lower Wick */}
        <line x1="50" y1={bodyTop + bodyHeight} x2="50" y2={wickBottom} stroke="#333" strokeWidth="6" strokeLinecap="round" />
        
        {/* Body Shadow (3D effect) */}
        <rect x="25" y={bodyTop + 4} width="50" height={bodyHeight} rx="12" fill={shadowColor} />
        
        {/* Main Body */}
        <rect x="25" y={bodyTop} width="50" height={bodyHeight} rx="12" fill={color} />
        
        {/* Highlight for gloss */}
        <rect x="28" y={bodyTop + 3} width="12" height={bodyHeight - 10} rx="6" fill="white" opacity="0.3" />

        {/* Face */}
        <motion.g
          animate={
            animate
              ? {
                  y: [0, 2, 0],
                }
              : {}
          }
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {eyes}
          {mouth}
          {/* Cheeks */}
          {(mood === "happy" || mood === "bullish") && (
            <>
              <ellipse cx="32" cy="62" rx="4" ry="2" fill="white" opacity="0.4" />
              <ellipse cx="68" cy="62" rx="4" ry="2" fill="white" opacity="0.4" />
            </>
          )}
        </motion.g>
        
        {/* Optional floating stars/coins for happy */}
        {mood === "happy" && (
          <motion.g
             animate={{ opacity: [0, 1, 0], y: [0, -20] }}
             transition={{ duration: 1.5, repeat: Infinity }}
          >
             <path d="M 80 20 L 85 30 L 95 30 L 87 37 L 90 47 L 80 41 L 70 47 L 73 37 L 65 30 L 75 30 Z" fill="#ffc800" transform="scale(0.4) translate(120, 0)" />
          </motion.g>
        )}
      </svg>
    </motion.div>
  );
}
