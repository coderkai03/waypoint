'use client';

import { useState, useCallback, useRef } from 'react';
import { useFlowStore } from '@/lib/store/flowStore';
import { textToSpeech } from './elevenlabs';

export function useVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { setIsRecording: setStoreRecording, setIsPlaying: setStorePlaying } = useFlowStore();

  const startRecording = useCallback(async () => {
    try {
      // Use Web Speech API for transcription
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported in this browser');
      }

      const recognition = new SpeechRecognition() as any;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      let finalTranscript = '';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setStoreRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setStoreRecording(false);
        
        if (finalTranscript.trim()) {
          // Add transcribed text to chat
          const store = useFlowStore.getState();
          store.addMessage({
            id: Date.now().toString(),
            role: 'user',
            content: finalTranscript.trim(),
            timestamp: new Date(),
          });
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      setStoreRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, [setStoreRecording]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setStoreRecording(false);
  }, [setStoreRecording]);

  const playText = useCallback(async (text: string) => {
    try {
      setIsPlaying(true);
      setStorePlaying(true);

      const audioBlob = await textToSpeech(text);
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        setStorePlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setStorePlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Failed to play text:', error);
      setIsPlaying(false);
      setStorePlaying(false);
    }
  }, [setStorePlaying]);

  const stopPlaying = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    setStorePlaying(false);
  }, [setStorePlaying]);

  return {
    isRecording,
    isPlaying,
    startRecording,
    stopRecording,
    playText,
    stopPlaying,
  };
}


