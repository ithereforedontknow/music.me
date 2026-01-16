import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";
import MoodSelection from "./MoodSelection";
import GenreSelection from "./GenreSelection";
import ReferenceTrack from "./ReferenceTrack";
import {
  springExpressive,
  pageTransition,
  buttonSpring,
} from "../../utils/motion";

const OnboardingFlow = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({
    moods: [],
    genres: [],
    referenceTrack: null,
  });

  const steps = [
    {
      component: MoodSelection,
      key: "mood",
      title: "Mood",
      color: "secondary",
      icon: "💫",
    },
    {
      component: GenreSelection,
      key: "genre",
      title: "Genre",
      color: "primary",
      icon: "🎵",
    },
    {
      component: ReferenceTrack,
      key: "reference",
      title: "Reference",
      color: "tertiary",
      icon: "🎯",
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
      moods: ["chill", "energetic", "happy"],
      genres: ["pop", "indie", "electronic"],
      referenceTrack: null,
      usedSurprise: true,
    });
  };

  const CurrentStep = steps[step].component;

  return (
    <div className="w-full flex flex-col min-h-[70vh]">
      {/* M3: Progress Steps */}
      {/* <div className="w-full max-w-3xl mx-auto mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            {steps.map((stepConfig, index) => {
              const isActive = index === step;
              const isCompleted = index < step;

              return (
                <div
                  key={index}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <div className="flex items-center w-full">
                    {index > 0 && (
                      <div
                        className={`flex-1 h-1 ${isCompleted ? "bg-primary" : "bg-outline-variant"} transition-colors`}
                      />
                    )}

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1, ...springExpressive }}
                      className={`
                        relative w-10 h-10 rounded-full flex items-center justify-center
                        border-2 transition-colors
                        ${
                          isActive
                            ? `border-${stepConfig.color} bg-${stepConfig.color}/10`
                            : isCompleted
                              ? "border-primary bg-primary/10"
                              : "border-outline-variant bg-surface"
                        }
                      `}
                    >
                      {isCompleted ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-primary text-on-primary rounded-full flex items-center justify-center"
                        >
                          <ChevronRight className="w-4 h-4 rotate-90" />
                        </motion.div>
                      ) : (
                        <span
                          className={`label-medium ${isActive ? `text-${stepConfig.color}` : "text-on-surface-variant"}`}
                        >
                          {stepConfig.icon}
                        </span>
                      )}
                    </motion.div>

                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-1 ${index < step ? "bg-primary" : "bg-outline-variant"} transition-colors`}
                      />
                    )}
                  </div>

                  <div className="text-center">
                    <span
                      className={`label-small ${isActive ? "text-on-surface font-medium" : "text-on-surface-variant"}`}
                    >
                      {stepConfig.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <motion.button
              onClick={handleSkip}
              className="m3-button-tonal flex items-center gap-2 px-4 py-2"
              {...buttonSpring}
            >
              <Sparkles className="w-4 h-4" />
              <span className="label-medium">Surprise Me</span>
            </motion.button>
          </div>
        </div>
      </div>*/}

      {/* Main Content */}
      <div className="flex-1 w-full">
        <AnimatePresence mode="wait">
          <motion.div key={step} {...pageTransition} className="w-full">
            <CurrentStep
              onComplete={handleStepComplete}
              initialData={selections}
              onSkip={() => handleStepComplete({ referenceTrack: null })}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingFlow;
