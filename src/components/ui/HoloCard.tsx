import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface HoloCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export function HoloCard({ children, className, glow = true, onClick }: HoloCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={cn(
        "relative rounded-3xl p-6 overflow-hidden glass-premium overscroll-none border-white/5",
        onClick && "cursor-pointer",
        glow && "hover:border-emerald-500/20 transition-all duration-500",
        className
      )}
    >
      {/* Subtle light sweep */}
      <motion.div 
        animate={{ 
          left: ['-100%', '200%']
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "linear"
        }}
        className="absolute w-[40%] h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent pointer-events-none z-0 skew-x-12"
      />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
