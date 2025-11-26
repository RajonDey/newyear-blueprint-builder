import { useEffect, useRef, useState } from "react";
import { logger } from "@/lib/logger";

export const useBackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check if user previously enabled music
    const savedPreference = localStorage.getItem("backgroundMusicEnabled");
    if (savedPreference === "true") {
      setIsEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (!audioRef.current && isEnabled) {
      // Create audio element with a calming ambient track
      // Using a free ambient music URL (you can replace with your own)
      audioRef.current = new Audio("https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }

    if (audioRef.current && isEnabled) {
      if (isPlaying) {
        audioRef.current.play().catch((e) => {
          logger.log("Audio play prevented:", e);
        });
      } else {
        audioRef.current.pause();
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [isPlaying, isEnabled]);

  const toggleMusic = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    setIsEnabled(true);
    localStorage.setItem("backgroundMusicEnabled", "true");
  };

  const disableMusic = () => {
    setIsPlaying(false);
    setIsEnabled(false);
    localStorage.setItem("backgroundMusicEnabled", "false");
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  return { isPlaying, toggleMusic, disableMusic, isEnabled };
};
