/**
 * Browser detection utilities for Web Speech API
 */

// Extend Window interface for webkit prefix
interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: typeof SpeechRecognition;
  webkitSpeechRecognition?: typeof SpeechRecognition;
}

/**
 * Check if the browser supports the Web Speech API
 */
export function isSpeechRecognitionSupported(): boolean {
  const win = window as SpeechRecognitionWindow;
  return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
}

/**
 * Get the SpeechRecognition constructor (handles webkit prefix)
 */
export function getSpeechRecognition(): typeof SpeechRecognition | null {
  const win = window as SpeechRecognitionWindow;
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}
