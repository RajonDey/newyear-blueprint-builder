import {
  type EmailPreferenceKey,
  isEmailPreferenceEnabled,
  parseUserPreferences,
} from "@/lib/user-preferences"

/** Returns true when the user has not opted out of this email type. */
export function shouldSendEmail(
  preferencesRaw: unknown,
  key: EmailPreferenceKey,
): boolean {
  return isEmailPreferenceEnabled(parseUserPreferences(preferencesRaw), key)
}
