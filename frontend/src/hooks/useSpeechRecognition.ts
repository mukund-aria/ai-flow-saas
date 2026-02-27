import { useState, useRef, useCallback, useEffect } from 'react';
import { getSpeechRecognition, isSpeechRecognitionSupported } from '@/lib/speech';

export type SpeechError =
  | 'not-supported'
  | 'no-permission'
  | 'not-allowed'
  | 'network'
  | 'aborted'
  | 'audio-capture'
  | 'unknown';

interface UseSpeechRecognitionReturn {
  /** Whether speech recognition is currently active */
  isListening: boolean;
  /** The final recognized transcript */
  transcript: string;
  /** Real-time partial results while speaking */
  interimTranscript: string;
  /** Current error state */
  error: SpeechError | null;
  /** Whether the browser supports speech recognition */
  isSupported: boolean;
  /** Start listening for speech */
  startListening: () => void;
  /** Stop listening */
  stopListening: () => void;
  /** Clear transcript and error */
  reset: () => void;
}

/**
 * Hook for using the Web Speech API for speech-to-text
 */
export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<SpeechError | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSupported = isSpeechRecognitionSupported();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('not-supported');
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) {
      setError('not-supported');
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognitionRef.current = recognition;

    // Configure recognition
    recognition.continuous = true; // Keep listening until manually stopped
    recognition.interimResults = true; // Get real-time partial results
    recognition.lang = 'en-US';

    // Clear previous state
    setError(null);
    setTranscript('');
    setInterimTranscript('');

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          currentInterim += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
        setInterimTranscript('');
      } else {
        setInterimTranscript(currentInterim);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      switch (event.error) {
        case 'not-allowed':
        case 'service-not-allowed':
          setError('not-allowed');
          break;
        case 'no-speech':
          // Not really an error - user just didn't speak
          // Don't set error, just stop
          break;
        case 'network':
          setError('network');
          break;
        case 'aborted':
          setError('aborted');
          break;
        case 'audio-capture':
          setError('audio-capture');
          break;
        default:
          setError('unknown');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    try {
      recognition.start();
    } catch (e) {
      setError('unknown');
      setIsListening(false);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const reset = useCallback(() => {
    stopListening();
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, [stopListening]);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    reset,
  };
}
