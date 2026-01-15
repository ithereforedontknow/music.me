import { motion } from "framer-motion";
import { useState } from "react";
import {
  Zap,
  Waves,
  Sun,
  Target,
  CloudRain,
  PartyPopper,
  Heart,
  Clock,
} from "lucide-react";

const MOODS = [
  { id: "energetic", icon: Zap, label: "Energetic", color: "text-yellow-500" },
  { id: "chill", icon: Waves, label: "Chill", color: "text-blue-500" },
  { id: "happy", icon: Sun, label: "Happy", color: "text-orange-500" },
  { id: "focused", icon: Target, label: "Focused", color: "text-purple-500" },
  {
    id: "melancholy",
    icon: CloudRain,
    label: "Melancholy",
    color: "text-gray-400",
  },
  { id: "party", icon: PartyPopper, label: "Party", color: "text-pink-500" },
  { id: "romantic", icon: Heart, label: "Romantic", color: "text-red-500" },
  { id: "nostalgic", icon: Clock, label: "Nostalgic", color: "text-amber-600" },
];

const MoodSelection = ({ onComplete, initialData }) => {
  const [selectedMoods, setSelectedMoods] = useState(initialData.moods || []);

  const toggleMood = (moodId) => {
    setSelectedMoods((prev) => {
      if (prev.includes(moodId)) {
        return prev.filter((id) => id !== moodId);
      } else if (prev.length < 3) {
        return [...prev, moodId];
      }
      return prev;
    });
  };

  const handleContinue = () => {
    onComplete({ moods: selectedMoods });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {MOODS.map((mood, index) => {
          const Icon = mood.icon;
          return (
            <motion.button
              key={mood.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => toggleMood(mood.id)}
              className={`relative p-4 rounded-xl border transition-all duration-200 ${
                selectedMoods.includes(mood.id)
                  ? "border-white bg-white/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${selectedMoods.includes(mood.id) ? "bg-white/10" : ""}`}
                >
                  <Icon className={`w-6 h-6 ${mood.color}`} />
                </div>
                <div className="text-sm font-medium text-white">
                  {mood.label}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-400">
          {selectedMoods.length} of 3 selected
        </p>
      </div>

      <button
        onClick={handleContinue}
        disabled={selectedMoods.length === 0}
        className={`w-full py-3 rounded-xl font-medium transition-all ${
          selectedMoods.length > 0
            ? "bg-white text-black hover:bg-gray-100"
            : "bg-white/10 text-white/40 cursor-not-allowed"
        }`}
      >
        {selectedMoods.length > 0 ? "Continue" : "Select at least one mood"}
      </button>
    </div>
  );
};

export default MoodSelection;
