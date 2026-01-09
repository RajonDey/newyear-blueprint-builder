import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { logger } from "@/lib/logger";
import { LifeCategory, ActionStep, WizardStep } from "@/types/wizard";

const CURRENT_SESSION_KEY = "current_wizard_session";

interface SavedWizardData {
  hasStarted?: boolean;
  currentStep?: WizardStep;
  primaryCategory?: LifeCategory | null;
  secondaryCategories?: LifeCategory[];
  lifeWheelRatings?: Record<LifeCategory, number>;
  selectedCategories?: LifeCategory[];
  goals?: Record<LifeCategory, string>;
  actions?: Record<LifeCategory, ActionStep>;
  habits?: Record<LifeCategory, string>;
  motivation?: Record<LifeCategory, { why: string; consequence: string }>;
  userName?: string;
  userEmail?: string;
}

export const useSaveResume = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    // Check if there's a session ID in URL
    const urlSessionId = searchParams.get("session");

    if (urlSessionId) {
      // Use session from URL
      setSessionId(urlSessionId);
      // Update current session tracker
      try {
        localStorage.setItem(CURRENT_SESSION_KEY, urlSessionId);
      } catch (error) {
        logger.error("Failed to save current session:", error);
      }
    } else {
      // No session in URL - try to discover existing session
      const discoveredSessionId = discoverExistingSession();

      if (discoveredSessionId) {
        // Found existing session - use it
        setSessionId(discoveredSessionId);
        setSearchParams({ session: discoveredSessionId }, { replace: true });
      } else {
        // No existing session - create new one
        const newSessionId = generateSessionId();
        setSessionId(newSessionId);
        setSearchParams({ session: newSessionId }, { replace: true });
        // Track as current session
        try {
          localStorage.setItem(CURRENT_SESSION_KEY, newSessionId);
        } catch (error) {
          logger.error("Failed to save current session:", error);
        }
      }
    }
  }, [searchParams, setSearchParams]);

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 11)}`;
  };

  /**
   * Discover existing session from localStorage
   * Priority: 1) Current session tracker, 2) Most recent session by timestamp
   */
  const discoverExistingSession = (): string | null => {
    try {
      // First, check if we have a tracked current session
      const currentSession = localStorage.getItem(CURRENT_SESSION_KEY);
      if (currentSession) {
        const sessionData = localStorage.getItem(`wizard_${currentSession}`);
        if (sessionData) {
          const parsed = JSON.parse(sessionData) as SavedWizardData;
          // Check if session has meaningful data (hasStarted or any wizard data)
          if (
            parsed &&
            (parsed.hasStarted ||
              parsed.currentStep !== undefined ||
              parsed.goals ||
              parsed.userName)
          ) {
            return currentSession;
          }
        }
      }

      // If no valid current session, find most recent session by scanning all wizard_ keys
      const allKeys = Object.keys(localStorage);
      const wizardKeys = allKeys.filter((key) =>
        key.startsWith("wizard_session_")
      );

      if (wizardKeys.length === 0) {
        return null;
      }

      // Find session with most recent data
      let mostRecentSession: { id: string; timestamp: number } | null = null;

      for (const key of wizardKeys) {
        try {
          const sessionData = localStorage.getItem(key);
          if (sessionData) {
            const parsed = JSON.parse(sessionData) as SavedWizardData;
            // Only consider sessions with meaningful data
            if (
              parsed &&
              (parsed.hasStarted ||
                parsed.currentStep !== undefined ||
                parsed.goals ||
                parsed.userName)
            ) {
              // Extract timestamp from session ID (format: session_TIMESTAMP_random)
              const sessionIdFromKey = key.replace("wizard_", "");
              const timestampMatch = sessionIdFromKey.match(/session_(\d+)_/);
              if (timestampMatch) {
                const timestamp = parseInt(timestampMatch[1], 10);
                if (
                  !mostRecentSession ||
                  timestamp > mostRecentSession.timestamp
                ) {
                  mostRecentSession = {
                    id: sessionIdFromKey,
                    timestamp: timestamp,
                  };
                }
              }
            }
          }
        } catch (error) {
          // Skip invalid sessions
          continue;
        }
      }

      if (mostRecentSession) {
        // Update current session tracker
        localStorage.setItem(CURRENT_SESSION_KEY, mostRecentSession.id);
        return mostRecentSession.id;
      }
    } catch (error) {
      logger.error("Failed to discover existing session:", error);
    }

    return null;
  };

  const getResumeLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?session=${sessionId}`;
  };

  const hasSavedSession = (): boolean => {
    if (!sessionId) return false;
    try {
      const saved = localStorage.getItem(`wizard_${sessionId}`);
      if (!saved) return false;
      const parsed = JSON.parse(saved) as SavedWizardData;
      // Check if session has meaningful data
      return !!(
        parsed &&
        (parsed.hasStarted ||
          parsed.currentStep !== undefined ||
          parsed.goals ||
          parsed.userName)
      );
    } catch (error) {
      return false;
    }
  };

  const loadSession = (): SavedWizardData | null => {
    if (!sessionId) return null;
    try {
      const saved = localStorage.getItem(`wizard_${sessionId}`);
      if (!saved) return null;
      const parsed = JSON.parse(saved) as SavedWizardData;
      // Only return if session has meaningful data
      if (
        parsed &&
        (parsed.hasStarted ||
          parsed.currentStep !== undefined ||
          parsed.goals ||
          parsed.userName)
      ) {
        return parsed;
      }
      return null;
    } catch (error) {
      logger.error("Failed to load session:", error);
      return null;
    }
  };

  const saveSession = (data: SavedWizardData) => {
    if (!sessionId) return;
    try {
      localStorage.setItem(`wizard_${sessionId}`, JSON.stringify(data));
      // Update current session tracker whenever we save
      localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
    } catch (error) {
      logger.error("Failed to save session:", error);
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
