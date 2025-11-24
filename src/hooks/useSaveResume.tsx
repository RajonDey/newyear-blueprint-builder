import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export const useSaveResume = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    // Check if there's a session ID in URL
    const urlSessionId = searchParams.get("session");
    
    if (urlSessionId) {
      // Load existing session
      setSessionId(urlSessionId);
    } else {
      // Generate new session ID
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      // Update URL with session ID
      setSearchParams({ session: newSessionId }, { replace: true });
    }
  }, []);

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  };

  const getResumeLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?session=${sessionId}`;
  };

  const hasSavedSession = () => {
    if (!sessionId) return false;
    const saved = localStorage.getItem(`wizard_${sessionId}`);
    return !!saved;
  };

  const loadSession = () => {
    if (!sessionId) return null;
    try {
      const saved = localStorage.getItem(`wizard_${sessionId}`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Failed to load session:", error);
      return null;
    }
  };

  const saveSession = (data: any) => {
    if (!sessionId) return;
    try {
      localStorage.setItem(`wizard_${sessionId}`, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save session:", error);
    }
  };

  return {
    sessionId,
    getResumeLink,
    hasSavedSession,
    loadSession,
    saveSession,
  };
};
