import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sun,
  Moon,
  Cat,
  Coffee,
  TreePine,
  Palette as PaletteIcon,
} from "lucide-react";

const ThemePicker = ({
  isOpen,
  onClose,
  themes,
  currentTheme,
  onThemeSelect,
}) => {
  // Map theme icons
  const getThemeIcon = (themeId) => {
    const iconMap = {
      light: Sun,
      dark: Moon,
      "catppuccin-mocha": Cat,
      "catppuccin-latte": Coffee,
      forest: TreePine,
      gruvbox: PaletteIcon,
    };
    return iconMap[themeId] || PaletteIcon;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/60 sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="
              bg-card
              rounded-t-[2rem] sm:rounded-3xl
              p-5 sm:p-8
              /* Width Logic: Mobile = 100%, Tablet = 80%, Desktop = max-w-lg */
              w-full sm:w-[85%] md:w-[70%] lg:max-w-xl
              shadow-2xl border border-theme
              max-h-[90vh] flex flex-col
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-primary">
                  Appearance
                </h3>
                <p className="text-sm text-secondary">Customize your view</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
                aria-label="Close picker"
              >
                <X className="w-6 h-6 text-primary" />
              </button>
            </div>

            {/* Theme Grid/List */}
            <div
              className="
              /* 1 col on mobile, 3 cols on desktop */
              grid grid-cols-1 lg:grid-cols-3
              gap-2 overflow-y-auto pr-1
              max-h-[60vh]
            "
            >
              {themes.map((theme) => {
                const IconComponent = getThemeIcon(theme.id);
                const isSelected = currentTheme === theme.id;

                return (
                  <motion.button
                    key={theme.id}
                    onClick={() => {
                      onThemeSelect(theme.id);
                      onClose();
                    }}
                    className={`
                      relative group w-full flex items-center
                      /* Desktop: stack icon/text | Mobile: stay as slim row */
                      lg:flex-col lg:justify-center lg:text-center
                      p-2 sm:p-3 rounded-xl transition-all duration-200
                      ${
                        isSelected
                          ? "bg-accent/10 border border-accent"
                          : "bg-secondary/30 border border-transparent hover:bg-secondary/60"
                      }
                    `}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Compact Icon */}
                    <div
                      className={`
                      p-1.5 rounded-lg transition-colors
                      mr-3 lg:mr-0 lg:mb-1.5
                      ${isSelected ? "text-accent" : "text-primary/70"}
                    `}
                    >
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>

                    {/* Compact Text */}
                    <div className="flex flex-col lg:items-center overflow-hidden">
                      <span className="font-medium text-primary text-sm sm:text-base truncate capitalize">
                        {theme.name}
                      </span>
                      {/* Hidden on mobile to keep the row height small */}
                      <span className="text-[10px] text-secondary font-mono opacity-50 hidden lg:block">
                        {theme.id}
                      </span>
                    </div>

                    {/* Minimal Selection Dot */}
                    {isSelected && (
                      <div className="absolute right-3 lg:top-2 lg:right-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-theme">
              <p className="text-xs sm:text-sm text-secondary text-center italic">
                Settings apply instantly to all open windows
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThemePicker;
