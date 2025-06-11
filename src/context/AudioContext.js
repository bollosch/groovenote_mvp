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

  // Repeat-one (loop) playback option (default: false)
  const repeatOne = false; // TODO: make this configurable in the future

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
    try {
      setRecordingError(null);
      setIsRecording(false);
    } catch (error) {
      setRecordingError('Failed to stop recording. Please try again.');
      cleanup();
    }
  }, [cleanup]);

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
        const lastBlob = newRecordings[newRecordings.length - 1];
        if (lastBlob) {
          const audio = new Audio(URL.createObjectURL(lastBlob));
          audio.addEventListener('loadedmetadata', () => {
            setDuration(audio.duration);
            setCurrentTime(0);
            setIsPlaying(false);
          });
          audioPlayerRef.current = audio;
          audioPlayerRef.current.currentTime = 0;
        }
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
              fallbackToPreviousRecording();
              shouldDeleteRef.current = false;
            }
          }
          audioChunksRef.current = [];
        };
      } catch (err) {
        setRecordingError('Could not access microphone. Please check permissions.');
      }
    }
    setupMediaRecorder();
    return () => cleanup();
  }, [cleanup, fallbackToPreviousRecording]);

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
    }
    // Always set currentTime to the currentTime state before playing
    audioPlayerRef.current.currentTime = currentTime;
    audioPlayerRef.current.onended = () => {
      if (repeatOne) {
        console.debug('[Debug] Repeat-one enabled: looping playback');
        audioPlayerRef.current.currentTime = 0;
        audioPlayerRef.current.play();
      } else {
        console.debug('[Debug] Playback ended: stopping and resetting timeline');
        setIsPlaying(false);
        setCurrentTime(0);
        clearInterval(timeUpdateIntervalRef.current);
        audioPlayerRef.current = null;
      }
    };
    audioPlayerRef.current.play();
    setIsPlaying(true);
    timeUpdateIntervalRef.current = setInterval(() => {
      if (audioPlayerRef.current) {
        setCurrentTime(audioPlayerRef.current.currentTime);
      }
    }, 100);
  }, [currentAudioBlob, currentTime, repeatOne]);

  const pause = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      clearInterval(timeUpdateIntervalRef.current);
    }
    setIsPlaying(false);
  }, []);

  const seek = useCallback((newTime) => {
    if (!currentAudioBlob) return;
    // If not playing, set currentTime and update state, but do not auto-play
    if (!isPlaying) {
      setCurrentTime(newTime);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.currentTime = newTime;
      }
      return;
    }
    // If playing, seek and continue playback
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(URL.createObjectURL(currentAudioBlob));
      audioPlayerRef.current.onended = () => {
        if (repeatOne) {
          audioPlayerRef.current.currentTime = 0;
          audioPlayerRef.current.play();
        } else {
          setIsPlaying(false);
          setCurrentTime(0);
          clearInterval(timeUpdateIntervalRef.current);
          audioPlayerRef.current = null;
        }
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
  }, [currentAudioBlob, isPlaying, repeatOne]);

  // Start recording with error handling
  const startRecording = useCallback(async () => {
    try {
      setRecordingError(null);
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
      setRecordingError('Failed to start recording. Please try again.');
      cleanup();
    }
  }, [cleanup]);

  // Delete recording with proper flag setting
  const deleteRecording = useCallback(async () => {
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
    if (isRecording) {
      try {
        await stopRecording();
        setTimeout(async () => {
          try {
            setRecordings(prev => {
              if (prev.length > 0) {
                const newRecordings = [...prev];
                const lastBlob = newRecordings[newRecordings.length - 1];
                if (lastBlob) {
                  lastBlob._metadata = { label: 'fs', isFalseStart: true };
                }
                return newRecordings;
              }
              return prev;
            });
            await startRecording();
          } catch (error) {
            setRecordingError('Failed to restart recording. Please try again.');
          }
        }, 100);
      } catch (error) {
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
    if (recordings.length === 0) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    } else {
      const lastBlob = recordings[recordings.length - 1];
      if (lastBlob) {
        const audio = new Audio(URL.createObjectURL(lastBlob));
        audio.addEventListener('loadedmetadata', () => {
          setDuration(audio.duration);
          setCurrentTime(0);
          setIsPlaying(false);
        });
        audioPlayerRef.current = audio;
        audioPlayerRef.current.currentTime = 0;
      }
    }
  }, [recordings]);

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