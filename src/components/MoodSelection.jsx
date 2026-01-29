import { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Wind,
  Smile,
  Target,
  Cloud,
  PartyPopper,
  Heart,
  Clock,
} from "lucide-react";
import { buttonSpring } from "../utils/motion";

const moods = [
  {
    id: "energetic",
    label: "Energetic",
    icon: Zap,
    color: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  {
    id: "chill",
    label: "Chill",
    icon: Wind,
    color: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    id: "happy",
    label: "Happy",
    icon: Smile,
    color: "bg-green-100 dark:bg-green-900/30",
  },
  {
    id: "focused",
    label: "Focused",
    icon: Target,
    color: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    id: "melancholy",
    label: "Melancholy",
    icon: Cloud,
    color: "bg-gray-100 dark:bg-gray-800/30",
  },
  {
    id: "party",
    label: "Party",
    icon: PartyPopper,
    color: "bg-pink-100 dark:bg-pink-900/30",
  },
  {
    id: "romantic",
    label: "Romantic",
    icon: Heart,
    color: "bg-red-100 dark:bg-red-900/30",
  },
  {
    id: "nostalgic",
    label: "Nostalgic",
    icon: Clock,
    color: "bg-orange-100 dark:bg-orange-900/30",
  },
];

const MoodSelection = ({ onComplete, initialData = {}, compact = false }) => {
  const [selectedMoods, setSelectedMoods] = useState(initialData.moods || []);

  const handleMoodToggle = (moodId) => {
    setSelectedMoods((prev) => {
      if (prev.includes(moodId)) {
        return prev.filter((id) => id !== moodId);
      } else {
        return [...prev, moodId];
      }
    });
  };

  const handleContinue = () => {
    if (onComplete) {
      onComplete({ moods: selectedMoods });
    }
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {moods.map((mood) => {
            const IconComponent = mood.icon;
            return (
              <motion.button
                key={mood.id}
                onClick={() => handleMoodToggle(mood.id)}
                className={`px-3 py-2 rounded-full flex items-center gap-2 transition-all border ${
                  selectedMoods.includes(mood.id)
                    ? `${mood.color} border-accent`
                    : "bg-secondary hover:bg-tertiary border-theme"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconComponent className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {mood.label}
                </span>
              </motion.button>
            );
          })}
        </div>
        <button
          onClick={handleContinue}
          className="text-sm text-accent hover:underline"
        >
          {selectedMoods.length > 0
            ? `${selectedMoods.length} mood${selectedMoods.length > 1 ? "s" : ""} selected`
            : "Select moods (optional)"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">
          How are you feeling?
        </h2>
        <p className="text-secondary">
          Select moods that match your current vibe
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {moods.map((mood) => {
          const IconComponent = mood.icon;
          return (
            <motion.button
              key={mood.id}
              onClick={() => handleMoodToggle(mood.id)}
              className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border ${
                selectedMoods.includes(mood.id)
                  ? `${mood.color} border-accent scale-105`
                  : "bg-card border-theme hover:border-accent"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconComponent className="w-8 h-8 text-primary" />
              <span className="font-medium text-primary">{mood.label}</span>
              {selectedMoods.includes(mood.id) && (
                <div className="w-3 h-3 rounded-full bg-accent mt-1" />
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="text-center">
        <motion.button
          onClick={handleContinue}
          className="bg-accent text-on-accent px-8 py-3 rounded-full shadow-m3-2 hover:shadow-m3-3 transition-all font-medium"
          disabled={selectedMoods.length === 0}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Continue with {selectedMoods.length} mood
          {selectedMoods.length !== 1 ? "s" : ""}
        </motion.button>
        <p className="text-sm text-secondary mt-4">
          You can skip this step if you don't have a specific mood in mind
        </p>
      </div>
    </div>
  );
};

export default MoodSelection;
