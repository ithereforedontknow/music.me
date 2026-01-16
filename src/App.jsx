import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music,
  AlertCircle,
  Settings,
  Info,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import ParticleCanvas from "./components/ParticleCanvas";
import LogoMorph from "./components/LogoMorph";
import OnboardingFlow from "./components/Onboarding/OnboardingFlow";
import GenerationSequence from "./components/GenerationSequence";
import SwipeInterface from "./components/SwipeInterface";
import BentoResults from "./components/BentoResults";
import { getCombinedRecommendations } from "./services/recommendationService";
import { springExpressive, pageTransition } from "./utils/motion";

const App = () => {
  const [flowState, setFlowState] = useState("logo");
  const [userPreferences, setUserPreferences] = useState({
    moods: [],
    genres: [],
    referenceTrack: null,
  });
  const [generatedDeck, setGeneratedDeck] = useState([]);
  const [likedTracks, setLikedTracks] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    hasLastFm: false,
    hasGemini: false,
    isDemoMode: true,
  });

  useEffect(() => {
    const lastfmKey = import.meta.env.VITE_LASTFM_API_KEY;
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const hasLastFm = !!lastfmKey && lastfmKey !== "your_lastfm_api_key_here";
    const hasGemini = !!geminiKey && geminiKey !== "your_gemini_api_key_here";

    setApiStatus({
      hasLastFm,
      hasGemini,
      isDemoMode: !hasLastFm || !hasGemini,
    });
  }, []);

  const handleLogoComplete = () => {
    setTimeout(() => setFlowState("onboarding"), 800);
  };

  const handleOnboardingComplete = async (preferences) => {
    setUserPreferences(preferences);
    setFlowState("generating");
    await generateDeckWithRecommendations(preferences);
  };

  const generateDeckWithRecommendations = async (preferences) => {
    const updateProgress = (progress, message) => {
      setLoadingProgress(progress);
      setLoadingMessage(message);
    };

    const simulateProgress = () => {
      const steps = [
        [10, "Analyzing your music taste"],
        [25, "Querying Last.fm database"],
        [40, "Consulting AI music expert"],
        [60, "Finding track matches"],
        [80, "Compiling recommendations"],
        [95, "Finalizing your discovery"],
        [100, "Ready to explore"],
      ];
      steps.forEach(([progress, message], index) => {
        setTimeout(() => {
          updateProgress(progress, message);
        }, index * 800);
      });
    };

    try {
      simulateProgress();
      const finalPreferences = {
        ...preferences,
        moods: preferences.moods?.length > 0 ? preferences.moods : ["chill"],
        genres: preferences.genres?.length > 0 ? preferences.genres : ["pop"],
      };

      const tracks = await getCombinedRecommendations(finalPreferences);
      if (tracks.length === 0) throw new Error("No recommendations received");

      setGeneratedDeck(tracks);
      setLikedTracks([]);

      setTimeout(() => {
        setFlowState("swiping");
        setLoadingProgress(0);
        setLoadingMessage("");
      }, 1200);
    } catch (error) {
      console.error("Deck generation failed:", error);
      const fallbackDeck = getFallbackDeck(preferences);
      setGeneratedDeck(fallbackDeck);
      setLikedTracks([]);
      setTimeout(() => {
        setFlowState("swiping");
        setLoadingProgress(0);
        setLoadingMessage("");
      }, 800);
    }
  };

  const getFallbackDeck = (preferences) => {
    return [
      {
        id: "fallback_1",
        name: "Blinding Lights",
        artist: { name: "The Weeknd" },
        album: { title: "After Hours" },
        images: {
          large:
            "https://i.scdn.co/image/ab67616d00001e02/4c5a1d3c7c20caa2ef52a2b0b9f8b1a8",
        },
        reason: `A synth-pop masterpiece`,
        genre: preferences.genres?.[0] || "pop",
        mood: preferences.moods?.[0] || "chill",
      },
    ];
  };

  const handleBackToStart = () => {
    setFlowState("onboarding");
    setGeneratedDeck([]);
    setLikedTracks([]);
    setShowResults(false);
  };

  const handleSaveTrack = (track) => {
    setLikedTracks((prev) => (prev.length >= 10 ? prev : [...prev, track]));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white text-gray-800 font-sans overflow-hidden">
      {/* Animated Background Blobs */}
      <ParticleCanvas isActive={flowState !== "swiping"} />

      {/* Top App Bar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={springExpressive}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          {/* Brand Logo */}
          <motion.div
            className="flex items-center gap-3 px-5 py-3 rounded-[28px] bg-white shadow-lg border border-gray-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="p-2 rounded-2xl bg-pink-100">
              <Music className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">music.me</h1>
              <p className="text-xs text-gray-600">Discover your sound</p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {apiStatus.isDemoMode && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-100"
                whileHover={{ scale: 1.05 }}
              >
                <Info className="w-4 h-4 text-amber-800" />
                <span className="text-sm font-medium text-amber-800">Demo</span>
              </motion.div>
            )}

            {(flowState === "swiping" || showResults) && (
              <motion.button
                onClick={handleBackToStart}
                className="bg-pink-500 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-pink-600 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">New Session</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <main className="relative z-10 pt-28 px-4 pb-8 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {flowState === "logo" && (
              <motion.div
                key="logo"
                className="flex justify-center items-center h-[70vh]"
                {...pageTransition}
              >
                <LogoMorph onComplete={handleLogoComplete} />
              </motion.div>
            )}

            {flowState === "onboarding" && (
              <motion.div
                key="onboarding"
                className="bg-white rounded-[28px] p-8 shadow-xl border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={springExpressive}
              >
                <OnboardingFlow onComplete={handleOnboardingComplete} />
              </motion.div>
            )}

            {flowState === "generating" && (
              <motion.div
                key="generating"
                className="flex justify-center items-center h-[70vh]"
                {...pageTransition}
              >
                <GenerationSequence
                  progress={loadingProgress}
                  preferences={userPreferences}
                  message={loadingMessage}
                />
              </motion.div>
            )}

            {flowState === "swiping" && !showResults && (
              <motion.div
                key="swiping"
                className="bg-gray-50 rounded-[28px] p-6 shadow-lg border border-gray-300"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={springExpressive}
              >
                <SwipeInterface
                  deck={generatedDeck}
                  onBack={handleBackToStart}
                  onSave={handleSaveTrack}
                  onViewResults={() => setShowResults(true)}
                  likedTracks={likedTracks}
                />
              </motion.div>
            )}

            {showResults && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={springExpressive}
              >
                <BentoResults
                  likedTracks={likedTracks}
                  onStartNew={handleBackToStart}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Demo Mode Banner */}
      <AnimatePresence>
        {apiStatus.isDemoMode && flowState === "onboarding" && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={springExpressive}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-md w-[90%]"
          >
            <div className="bg-white rounded-[24px] p-4 shadow-2xl border border-gray-300 flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">Demo Mode</p>
                <p className="text-sm text-gray-600">
                  Add API keys for full experience
                </p>
              </div>
              <motion.button
                className="p-2 hover:bg-gray-100 rounded-full"
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
