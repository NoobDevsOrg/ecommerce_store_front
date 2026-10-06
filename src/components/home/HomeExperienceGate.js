"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const INTRO_KEY = "sagunthala-home-intro-seen";
const SOUND_PREFERENCE_KEY = "sagunthala-home-sound-preference";

const createAmbientAudio = () => {
  const audio = new Audio("/audio.mp3");
  audio.loop = true;
  audio.preload = "metadata";
  return audio;
};

export default function HomeExperienceGate({ children }) {
  const [state, setState] = useState("checking");
  const [soundState, setSoundState] = useState("off");
  const [soundPreference, setSoundPreference] = useState("disabled");
  const dialogRef = useRef(null);
  const primaryActionRef = useRef(null);
  const soundToggleRef = useRef(null);
  const audioRef = useRef(null);

  const ensureAudio = () => {
    if (audioRef.current) return audioRef.current;

    const audio = createAmbientAudio();
    audio.addEventListener("playing", () => setSoundState("playing"));
    audio.addEventListener("pause", () => setSoundState("off"));
    audio.addEventListener("ended", () => setSoundState("off"));
    audio.addEventListener("error", () => setSoundState("unavailable"));
    audioRef.current = audio;
    return audio;
  };

  const startSound = () => {
    const audio = ensureAudio();

    // `play()` runs directly in the click event path, satisfying autoplay rules.
    return audio.play()
      .then(() => {
        const isPlaying = !audio.paused && !audio.ended;
        setSoundState(isPlaying ? "playing" : "off");
        setSoundPreference(isPlaying ? "enabled" : "disabled");
        window.sessionStorage.setItem(SOUND_PREFERENCE_KEY, isPlaying ? "enabled" : "disabled");
        return isPlaying;
      })
      .catch(() => {
        setSoundState("unavailable");
        setSoundPreference("disabled");
        window.sessionStorage.setItem(SOUND_PREFERENCE_KEY, "disabled");
        return false;
      });
  };

  const stopSound = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setSoundState("off");
    setSoundPreference("disabled");
    window.sessionStorage.setItem(SOUND_PREFERENCE_KEY, "disabled");
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSoundPreference(window.sessionStorage.getItem(SOUND_PREFERENCE_KEY) === "enabled" ? "enabled" : "disabled");
      setState(window.sessionStorage.getItem(INTRO_KEY) ? "ready" : "choice");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (state === "choice") primaryActionRef.current?.focus();
    if (state === "ready") window.requestAnimationFrame(() => soundToggleRef.current?.focus());
  }, [state]);

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.visibilityState === "hidden" && !audioRef.current?.paused) audioRef.current.pause();
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, []);

  useEffect(() => () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    audioRef.current = null;
  }, []);

  const completeIntro = (withSound) => {
    window.sessionStorage.setItem(INTRO_KEY, "true");
    if (withSound) startSound();
    else stopSound();

    const finish = () => setState("ready");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !dialogRef.current) {
      finish();
      return;
    }
    gsap.to(dialogRef.current, { autoAlpha: 0, y: -10, duration: 0.3, ease: "power2.in", onComplete: finish });
  };

  const toggleSound = () => {
    if (soundState === "playing") {
      stopSound();
      return;
    }
    startSound();
  };

  const trapDialogFocus = (event) => {
    if (event.key !== "Tab") return;
    const focusable = Array.from(dialogRef.current?.querySelectorAll("button:not([disabled])") || []);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const soundButtonCopy = soundState === "playing" ? "Mute sound" : soundPreference === "enabled" ? "Resume sound" : "Enable sound";
  const soundStatus = soundState === "playing" ? "Ambient sound is playing" : soundState === "unavailable" ? "Ambient sound could not be started" : soundPreference === "enabled" ? "Ambient sound is paused" : "Ambient sound is off";

  return (
    <>
      {/* Keep the homepage in the initial HTML. The experience choice is an
          overlay for people, never a prerequisite for crawlable content. */}
      {children}
      {state === "choice" ? (
        <div ref={dialogRef} onKeyDown={trapDialogFocus} className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[radial-gradient(circle_at_50%_10%,rgba(212,175,55,.16),transparent_34%),linear-gradient(135deg,rgba(8,5,12,.96),rgba(20,10,28,.92))] px-4 py-6 backdrop-blur-md sm:px-6" role="dialog" aria-modal="true" aria-labelledby="home-experience-title" aria-describedby="home-experience-description">
          <section className="relative w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-[#d4af37]/45 bg-[linear-gradient(145deg,rgba(36,24,45,.98),rgba(15,9,23,.98))] px-6 py-8 text-center shadow-[0_30px_100px_rgba(0,0,0,.65),0_0_0_1px_rgba(255,255,255,.04)_inset] sm:px-10 sm:py-11">
            <div className="pointer-events-none absolute inset-3 rounded-[1.25rem] border border-[#f0d984]/10" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full border border-[#d4af37]/15" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-[#d4af37]/[.045] blur-2xl" aria-hidden="true" />
            <div className="relative">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#edca65] sm:text-[11px]">Sagunthala Jewellers</p>
              <div className="mx-auto mt-5 flex items-center justify-center gap-3" aria-hidden="true"><span className="h-px w-8 bg-[#d4af37]/65" /><span className="h-1.5 w-1.5 rotate-45 border border-[#f0d984]" /><span className="h-px w-8 bg-[#d4af37]/65" /></div>
              <h1 id="home-experience-title" className="mt-6 font-serif text-3xl leading-tight text-[#fffaf0] sm:text-[2.6rem]">A graceful welcome</h1>
              <p id="home-experience-description" className="mx-auto mt-4 max-w-sm text-sm leading-7 text-stone-300 sm:text-[15px]">Enter the collection with a gentle ambient score, or continue in quiet comfort. You can change this at any time.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <button ref={primaryActionRef} type="button" onClick={() => completeIntro(true)} className="group min-h-14 rounded-md border border-[#f5dda0]/70 bg-[linear-gradient(135deg,#f0d984,#c99c2f)] px-4 py-3 text-left text-[#17101c] shadow-[0_10px_30px_rgba(212,175,55,.18)] transition duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_14px_36px_rgba(212,175,55,.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0d984]">
                  <span className="block text-xs font-extrabold uppercase tracking-[0.13em]">Enter with sound</span>
                  <span className="mt-1 block text-[11px] font-medium text-[#3b2a0b]/85">Begin with ambient audio</span>
                </button>
                <button type="button" onClick={() => completeIntro(false)} className="group min-h-14 rounded-md border border-white/25 bg-white/[.025] px-4 py-3 text-left text-white transition duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-[#d4af37]/75 motion-safe:hover:bg-white/[.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                  <span className="block text-xs font-bold uppercase tracking-[0.13em]">Continue without sound</span>
                  <span className="mt-1 block text-[11px] text-stone-400 transition group-hover:text-stone-300">Enjoy the collection in silence</span>
                </button>
              </div>
              <p className="mt-5 text-[10px] uppercase tracking-[0.18em] text-stone-500">Your preference stays with this visit</p>
            </div>
          </section>
        </div>
      ) : null}
      {state === "ready" ? <><button ref={soundToggleRef} type="button" onClick={toggleSound} aria-pressed={soundState === "playing"} aria-label={`${soundButtonCopy}. ${soundStatus}.`} className="fixed bottom-5 right-5 z-40 min-h-11 rounded-full border border-[#d4af37]/45 bg-[#120d1b]/95 px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#f0d984] shadow-[0_10px_28px_rgba(0,0,0,.35)] backdrop-blur transition duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-[#f0d984] motion-safe:hover:bg-[#21152d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0d984]">{soundButtonCopy}</button><p className="sr-only" role="status" aria-live="polite">{soundStatus}</p></> : null}
    </>
  );
}
