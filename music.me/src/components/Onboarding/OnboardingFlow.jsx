import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";
import MoodSelection from "./MoodSelection";
import GenreSelection from "./GenreSelection";
import ReferenceTrack from "./ReferenceTrack";

const OnboardingFlow = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({
    moods: [],
    genres: [],
    referenceTrack: null,
  });

  const steps = [
    {
      title: "How are you feeling?",
      subtitle: "Select 1-3 moods",
      component: MoodSelection,
    },
    {
      title: "What's your vibe?",
      subtitle: "Pick your favorite genres",
      component: GenreSelection,
    },
    {
      title: "Got a favorite track?",
      subtitle: "Optional - for personalized recommendations",
      component: ReferenceTrack,
    },
  ];

  const handleStepComplete = (data) => {
    const newSelections = { ...selections, ...data };
    setSelections(newSelections);

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(newSelections);
    }
  };

  const handleSkip = () => {
    onComplete({
      ...selections,
      ReferenceTrack: null,
      usedSurprise: true,
    });
  };

  const CurrentStep = steps[step].component;

  return (
    <div className="min-h-[60vh] flex flex-col">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-2">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              className={`h-1 rounded-full ${index <= step ? "bg-violet-600 " : "bg-white/10"}`}
              initial={{ width: "0px" }}
              animate={{ width: index <= step ? "32px" : "12px" }}
              transition={{ delay: index * 0.1 }}
            />
          ))}
        </div>

        <button
          onClick={handleSkip}
          className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1"
        >
          Surprise Me <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* Step content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-black text-white mb-2">
                {steps[step].title}
              </h2>
              <p className="text-gray-400">{steps[step].subtitle}</p>
            </div>

            <CurrentStep
              onComplete={handleStepComplete}
              initialData={selections}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step counter */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Step {step + 1} of {steps.length}
          </span>

          {step < steps.length - 1 && (
            <button
              onClick={() => handleStepComplete({})}
              className="text-white hover:text-white/80 text-sm font-medium flex items-center gap-1"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
