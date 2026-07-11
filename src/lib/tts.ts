/**
 * Thin wrapper over the Web Speech API for spoken turn-by-turn guidance — the
 * primary output channel for blind and low-vision fans. No-ops safely on the
 * server and where speech synthesis is unavailable.
 */
export function speak(text: string): void {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en";
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}
