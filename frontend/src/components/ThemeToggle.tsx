import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative flex items-center gap-2 p-2 rounded-2xl transition-all duration-300 border backdrop-blur-xl ${
        isDark 
          ? 'bg-white/10 hover:bg-white/15 text-yellow-400 border-white/15 shadow-[0_0_15px_rgba(234,179,8,0.15)]' 
          : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-md shadow-slate-200/50'
      } ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme mode"
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, scale: 0.7, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 90, scale: 0.7, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
        ) : (
          <Moon className="w-5 h-5 text-indigo-600 drop-shadow-[0_0_6px_rgba(79,70,229,0.3)]" />
        )}
      </motion.div>

      {showLabel && (
        <span className="text-xs font-bold tracking-wide">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}
