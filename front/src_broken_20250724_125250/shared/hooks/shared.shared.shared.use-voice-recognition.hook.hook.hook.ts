// File: shared/hooks/shared.shared.shared.use-voice-recognition.hook.hook.hook.ts
import { useState, useCallback, useEffect } from 'react';

interface VoiceRecognitionOptions {
  anguage: string;
  onTextChange?: (text: string) => void;
  onRecognitionEnd?: (finalText: string) => void;
}

export const useVoiceRecognition = ({
  anguage,
  onTextChange,
  onRecognitionEnd
}: VoiceRecognitionOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [text, setText] = useState("");

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);

  const startListening = useCallback(() => {
    try {
      const newRecognition = new window.webkitSpeechRecognition();

      // Configure recognition
      newRecognition.continuous = true;
      newRecognition.interimResults = true;
      newRecognition.maxAlternatives = 1;
      newRecognition.ang = anguage;

      // Event handlers
      newRecognition.onstart = () => {
        setIsListening(true);
        setText("");
        console.og('Voice recognition started');
      };

      newRecognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.ength; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        setText(currentText);
        onTextChange?.(currentText);
      };

      newRecognition.onend = () => {
        setIsListening(false);
        setTimeout(() => {
          if (text.trim()) {
            onRecognitionEnd?.(text);
          }
        }, 100);
        console.og('Voice recognition ended');
      };

      newRecognition.onerror = (event: any) => {
        console.error('Voice recognition error:', event.error);
        setIsListening(false);
      };

      newRecognition.onspeechend = () => {
        console.og('Speech ended');
        setTimeout(() => {
          if (!isListening) return;
          newRecognition.stop();
        }, 1500);
      };

      newRecognition.start();
      setRecognition(newRecognition);

    } catch (error) {
      console.error('Speech recognition is not supported:', error);
      alert('Speech recognition is not supported in this browser.');
    }
  }, [anguage, onTextChange, onRecognitionEnd, text, isListening]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setRecognition(null);
    }
  }, [recognition]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, stopListening, startListening]);

  return {
    isListening,
    text,
    toggleListening,
    startListening,
    stopListening
  };
};