import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';

const AudioContext = createContext();

const MAX_RECORDINGS = 10; // Maximum number of recordings to keep

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

  // Reset recording with history management
  const resetRecording = useCallback(async () => {
    console.log('[Debug] AudioContext: Resetting recording state');
    await stopRecording(); // Always stop first
    cleanup();
    if (recordings.length <= 1) {
      setRecordings([]);
      setDuration(0);
      setCurrentTime(0);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    } else {
      setRecordings(prev => {
        const newRecordings = prev.slice(0, -1);
        const lastBlob = newRecordings[newRecordings.length - 1];
        if (lastBlob) {
          const audio = new Audio(URL.createObjectURL(lastBlob));
          audio.addEventListener('loadedmetadata', () => {
            setDuration(audio.duration);
          });
        }
        return newRecordings;
      });
    }
  }, [cleanup, recordings.length, stopRecording]);

  // Helper: fallback to previous recording or clear all
  const fallbackToPreviousRecording = useCallback(() => {
    setRecordings(prev => {
      if (prev.length <= 1) {
        setDuration(0);
        setCurrentTime(0);
        setIsPlaying(false);
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          audioPlayerRef.current = null;
        }
        return [];
      } else {
        const newRecordings = prev.slice(0, -1);
        return newRecordings;
      }
    });
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
                setRecordings(prev => {
                  const newRecordings = [...prev, blob];
                  if (newRecordings.length > MAX_RECORDINGS) {
                    return newRecordings.slice(-MAX_RECORDINGS);
                  }
                  return newRecordings;
                });
                const audio = new Audio(URL.createObjectURL(blob));
                audio.addEventListener('loadedmetadata', () => {
                  setDuration(audio.duration);
                });
              } catch (error) {
                setRecordingError('Failed to save recording. Please try again.');
              }
            } else {
              console.log('[Debug] onstop: shouldDeleteRef true, fallback to previous recording');
              fallbackToPreviousRecording();
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

    return () => cleanup();
  }, [cleanup, recordings.length, fallbackToPreviousRecording]);

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

  // Start recording with error handling
  const startRecording = useCallback(async () => {
    try {
      setRecordingError(null);
      // Always reset playback, even if paused
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
        setIsPlaying(false);
        setCurrentTime(0);
      }
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

  // Delete recording with proper flag setting
  const deleteRecording = useCallback(async () => {
    console.log('[Debug] AudioContext: Deleting recording');
    if (isRecording) {
      shouldDeleteRef.current = true;  // Set delete flag before stopping
      await stopRecording();
      // Do NOT call fallback here!
    } else {
      fallbackToPreviousRecording();
      shouldDeleteRef.current = false;
    }
  }, [isRecording, stopRecording, fallbackToPreviousRecording]);

  // Restart recording (mark current as false start and start new)
  const restartRecording = useCallback(async () => {
    console.log('[Debug] AudioContext: Restarting recording');
    if (isRecording) {
      try {
        // Stop current recording first
        await stopRecording();
        
        // Wait a moment for the recording to finish processing
        setTimeout(async () => {
          try {
            // Mark the last recorded blob as false start
            setRecordings(prev => {
              if (prev.length > 0) {
                const newRecordings = [...prev];
                const lastBlob = newRecordings[newRecordings.length - 1];
                if (lastBlob) {
                  // Add metadata to mark as false start
                  lastBlob._metadata = { label: 'fs', isFalseStart: true };
                  console.log('[Debug] Marked last recording as false start');
                }
                return newRecordings;
              }
              return prev;
            });
            
            // Start new recording, with a delay of 700ms to ensure the previous recording is processed
            await startRecording();
            console.log('[Debug] New recording started after restart');
          } catch (error) {
            console.error('Failed to start new recording after restart:', error);
            setRecordingError('Failed to restart recording. Please try again.');
          }
                  }, 100); // 100ms buffer for safe processing
      } catch (error) {
        console.error('Failed to stop recording for restart:', error);
        setRecordingError('Failed to restart recording. Please try again.');
      }
    }
  }, [isRecording, stopRecording, startRecording]);

  // Stop playback completely
  const stop = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      clearInterval(timeUpdateIntervalRef.current);
    }
  }, []);

  // Effect: When recordings change, set up audio player and UI state for the latest recording
  useEffect(() => {
    console.log('[Debug] useEffect recordings changed:', recordings.length);
    if (recordings.length === 0) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      console.log('[Debug] No recordings left, player reset');
    } else {
      const lastBlob = recordings[recordings.length - 1];
      if (lastBlob) {
        const audio = new Audio(URL.createObjectURL(lastBlob));
        audio.addEventListener('loadedmetadata', () => {
          setDuration(audio.duration);
          setCurrentTime(0);
          setIsPlaying(false);
          console.log('[Debug] Fallback to previous recording, duration:', audio.duration);
        });
        audioPlayerRef.current = audio;
        audioPlayerRef.current.currentTime = 0;
        console.log('[Debug] Audio player set up for fallback blob');
      }
    }
  }, [recordings, setIsPlaying, setCurrentTime, setDuration]);

  return (
    <AudioContext.Provider value={{
      recordings,
      isPlaying,
      currentTime,
      duration,
      isRecording,
      recordingTime,
      recordingError,
      startRecording,
      stopRecording,
      resetRecording,
      deleteRecording,
      restartRecording,
      play,
      pause,
      seek,
      stop,
      setCurrentTime,
      setDuration,
      currentAudioBlob: recordings.length > 0 ? recordings[recordings.length - 1] : null
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = () => useContext(AudioContext); 