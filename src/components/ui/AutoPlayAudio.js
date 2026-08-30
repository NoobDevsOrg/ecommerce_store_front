"use client";

import { useEffect, useRef, useState } from "react";

export default function AutoPlayAudio() {
  const audioRef = useRef(null);

  const [isMuted, setIsMuted] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const TIME_STORAGE_KEY = "siteAudioCurrentTime";
    const MUTE_STORAGE_KEY = "siteAudioMuted";

    const cachedMuted = localStorage.getItem(MUTE_STORAGE_KEY);
    const initialMuted = cachedMuted === "true";

    const audio = new Audio("/audio.mp3");
    audio.loop = true;
    audio.preload = "auto";
    audio.muted = true;

    audioRef.current = audio;
    setIsMuted(initialMuted);

    // Restore time
    const cachedTime = localStorage.getItem(TIME_STORAGE_KEY);
    if (cachedTime) {
      const parsed = Number(cachedTime);
      if (!isNaN(parsed)) {
        audio.currentTime = parsed;
      }
    }

    // Save time
    const saveTime = () => {
      localStorage.setItem(TIME_STORAGE_KEY, String(audio.currentTime));
    };

    audio.addEventListener("timeupdate", saveTime);
    window.addEventListener("pagehide", saveTime);

    // Show popup only first time
  // ✅ NEW (1 hour control)
// const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds for production
const ONE_HOUR = 10 * 1000; // 10 milliseconds for testing

const lastVisit = localStorage.getItem("visitedTime");
const now = Date.now();

if (!lastVisit || now - Number(lastVisit) > ONE_HOUR) {
  setTimeout(() => setShowPopup(true), 1000);
  localStorage.setItem("visitedTime", String(now));
}

    return () => {
      saveTime();
      audio.pause();
      audio.removeEventListener("timeupdate", saveTime);
      window.removeEventListener("pagehide", saveTime);
    };
  }, []);

  // 👉 Start experience (main control)
  const handleEnter = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.muted = false;
      await audio.play();
      setIsMuted(false);
      setHasStarted(true);
    } catch {}

    setShowPopup(false);
  };

  const handleContinue = () => {
    setShowPopup(false);
  };

  // 👉 Toggle button (after start)
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const next = !isMuted;
    audio.muted = next;
    setIsMuted(next);
    localStorage.setItem("siteAudioMuted", String(next));
  };

  return (
    <>
      {/* 🌟 Welcome Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111] px-8 py-10 rounded-2xl text-center shadow-xl max-w-md w-[90%]">
            <h1 className="text-2xl text-amber-600 mb-3">Welcome ✨</h1>
            <h2 className="mb-4">Sagunthala Jewellers</h2>

            <p className="text-sm text-gray-500 mb-6">
              Step into a world of timeless elegance and divine craftsmanship.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleEnter}
                className="bg-amber-500 text-white py-2 rounded"
              >
                Enter Experience ✨
              </button>

              <button
                onClick={handleContinue}
                className="border py-2 rounded"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔘 Mute Button (only after start) */}
      {hasStarted && (
        <button
          onClick={toggleMute}
          className="fixed bottom-5 right-5 z-[1001] rounded-full border border-[#b48a3c]/40 bg-[#0f0a1a]/90 px-4 py-2 text-xs text-[#d4af37]"
        >
          {isMuted ? "Sound On" : "Sound Off"}
        </button>
      )}
    </>
  );
}