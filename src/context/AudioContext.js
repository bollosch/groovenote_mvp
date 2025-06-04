import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  // State for recordings and playback
  const [recordings, setRecordings] = useState([]); // Array of Blobs
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingError, setRecordingError] = useState(null);

  // Refs for media recorder and audio player
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);
  const shouldDeleteRef = useRef(false);
  const timeUpdateIntervalRef = useRef(null);

  // Helper: get current blob
  const currentAudioBlob = recordings.length > 0 ? recordings[recordings.length - 1] : null;

  // Cleanup function for audio resources
  const cleanup = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    audioChunksRef.current = [];
    setRecordingError(null);
  }, []);

  // Setup media recorder on mount with error handling
  useEffect(() => {
    async function setupMediaRecorder() {
      try {
        setRecordingError(null);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new window.MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onerror = (error) => {
          console.error('MediaRecorder error:', error);
          setRecordingError('Recording failed. Please try again.');
          cleanup();
        };

        mediaRecorderRef.current.onstop = () => {
          if (audioChunksRef.current.length > 0) {
            if (!shouldDeleteRef.current) {
              try {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setRecordings(prev => [...prev, blob]);
                // Get duration of the new recording
                const audio = new Audio(URL.createObjectURL(blob));
                audio.addEventListener('loadedmetadata', () => {
                  setDuration(audio.duration);
                });
              } catch (error) {
                console.error('Error creating recording blob:', error);
                setRecordingError('Failed to save recording. Please try again.');
              }
            } else {
              setRecordings([]);
              setDuration(0);
              setCurrentTime(0);
              shouldDeleteRef.current = false;
            }
          }
          audioChunksRef.current = [];
        };
      } catch (err) {
        console.error('Error accessing microphone:', err);
        setRecordingError('Could not access microphone. Please check permissions.');
      }
    }
    setupMediaRecorder();

    // Cleanup on unmount
    return () => {
      cleanup();
      // Release media stream
      if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cleanup]);

  // Handle recording state changes
  useEffect(() => {
    if (isRecording && mediaRecorderRef.current) {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
    } else if (!isRecording && mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  // Timer effect for recording
  useEffect(() => {
    let timer;
    if (isRecording) {
      setRecordingTime(0);
      timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Playback controls
  const play = useCallback(() => {
    if (!currentAudioBlob) return;
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(URL.createObjectURL(currentAudioBlob));
      audioPlayerRef.current.currentTime = currentTime;
      audioPlayerRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        clearInterval(timeUpdateIntervalRef.current);
        audioPlayerRef.current = null;
      };
    }
    audioPlayerRef.current.play();
    setIsPlaying(true);
    timeUpdateIntervalRef.current = setInterval(() => {
      if (audioPlayerRef.current) {
        setCurrentTime(audioPlayerRef.current.currentTime);
      }
    }, 100);
  }, [currentAudioBlob, currentTime]);

  const pause = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      clearInterval(timeUpdateIntervalRef.current);
    }
    setIsPlaying(false);
  }, []);

  const seek = useCallback((newTime) => {
    if (!currentAudioBlob) return;
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(URL.createObjectURL(currentAudioBlob));
      audioPlayerRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        clearInterval(timeUpdateIntervalRef.current);
        audioPlayerRef.current = null;
      };
    }
    audioPlayerRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    audioPlayerRef.current.play();
    setIsPlaying(true);
    if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);
    timeUpdateIntervalRef.current = setInterval(() => {
      if (audioPlayerRef.current) {
        setCurrentTime(audioPlayerRef.current.currentTime);
      }
    }, 100);
  }, [currentAudioBlob]);

  // Reset recording
  const resetRecording = useCallback(() => {
    console.log('[Debug] AudioContext: Resetting recording state');
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
    if (mediaRecorderRef.current?.state === 'recording') {
      console.log('[Debug] AudioContext: Stopping active recording for deletion');
      shouldDeleteRef.current = true;
      mediaRecorderRef.current.stop();
    } else {
      console.log('[Debug] AudioContext: Clearing recordings array');
      setRecordings([]);
      setDuration(0);
    }
  }, []);

  // Start recording with error handling
  const startRecording = useCallback(async () => {
    try {
      setRecordingError(null);
      if (!mediaRecorderRef.current) {
        throw new Error('MediaRecorder not initialized');
      }
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setRecordingError('Failed to start recording. Please try again.');
      cleanup();
    }
  }, [cleanup]);

  // Stop recording with error handling
  const stopRecording = useCallback(async () => {
    console.log('[Debug] AudioContext: stopRecording called');
    try {
      setRecordingError(null);
      setIsRecording(false);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setRecordingError('Failed to stop recording. Please try again.');
      cleanup();
    }
  }, [cleanup]);

  return (
    <AudioContext.Provider value={{
      recordings,
      isPlaying,
      currentTime,
      duration,
      isRecording,
      play,
      pause,
      seek,
      resetRecording,
      setCurrentTime,
      setDuration,
      currentAudioBlob,
      startRecording,
      stopRecording,
      recordingTime,
      recordingError
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = () => useContext(AudioContext); 