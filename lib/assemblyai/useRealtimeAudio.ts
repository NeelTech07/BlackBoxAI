'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ConnectionState, TranscriptSegment } from '@/types/blackbox';

const SAMPLE_RATE = 16000;

interface UseRealtimeAudioOptions {
  onSegmentReceived?: (segment: TranscriptSegment) => void;
  onError?: (errorMessage: string) => void;
}

export function useRealtimeAudio(options: UseRealtimeAudioOptions = {}) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('READY');
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [currentPartial, setCurrentPartial] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSimulatedMode, setIsSimulatedMode] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [waveformFreqs, setWaveformFreqs] = useState<number[]>(new Array(32).fill(6));

  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);
  
  // Ref tracking active listening state to avoid stale closure drops in requestAnimationFrame
  const isListeningRef = useRef<boolean>(false);

  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const convertFloat32To16BitPCM = (input: Float32Array): ArrayBuffer => {
    const output = new DataView(new ArrayBuffer(input.length * 2));
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return output.buffer;
  };

  // High-fidelity voice spectrum visualizer loop
  const updateAudioVisualizer = useCallback(() => {
    if (!analyserRef.current || !isListeningRef.current) return;

    const fftSize = analyserRef.current.frequencyBinCount; // 1024
    const freqData = new Uint8Array(fftSize);
    const timeData = new Uint8Array(fftSize);

    analyserRef.current.getByteFrequencyData(freqData);
    analyserRef.current.getByteTimeDomainData(timeData);

    // Compute peak mic volume from time-domain waveform displacement
    let maxDisplacement = 0;
    for (let i = 0; i < timeData.length; i++) {
      const displacement = Math.abs(timeData[i] - 128);
      if (displacement > maxDisplacement) {
        maxDisplacement = displacement;
      }
    }
    const computedLevel = Math.min(100, Math.round((maxDisplacement / 128) * 100));
    setAudioLevel(computedLevel);

    // Sample 32 logarithmic frequency bands (voice pitch to formants & sibilance)
    const sampled: number[] = [];
    for (let i = 0; i < 32; i++) {
      const binIdx = Math.min(
        freqData.length - 1,
        Math.floor(Math.pow(i / 31, 2.2) * 512 + 1)
      );

      const b1 = freqData[binIdx] || 0;
      const b2 = freqData[Math.min(freqData.length - 1, binIdx + 1)] || 0;
      const b3 = freqData[Math.min(freqData.length - 1, binIdx + 2)] || 0;
      const avgFreq = (b1 + b2 + b3) / 3;

      const centerDist = Math.abs(i - 15.5) / 15.5;
      const envelope = Math.cos(centerDist * (Math.PI / 2.2));

      const voiceFactor = computedLevel > 2 ? (computedLevel / 100) * 32 : 0;
      const freqFactor = (avgFreq / 255) * 44 * (0.4 + envelope * 0.8);
      
      const height = Math.max(6, Math.min(56, Math.round(freqFactor + voiceFactor)));
      sampled.push(height);
    }

    setWaveformFreqs(sampled);

    if (isListeningRef.current) {
      animFrameRef.current = requestAnimationFrame(updateAudioVisualizer);
    }
  }, []);

  const cleanupAudio = useCallback(() => {
    isListeningRef.current = false;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    if (scriptNodeRef.current) {
      scriptNodeRef.current.disconnect();
      scriptNodeRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setAudioLevel(0);
    setWaveformFreqs(new Array(32).fill(6));
  }, []);

  const startSimulatedStream = useCallback(() => {
    setIsSimulatedMode(true);
    setConnectionState('LISTENING');
    isListeningRef.current = true;
    setErrorMessage(null);

    const demoPhrases = [
      'Patient oxygen saturation is dropping.',
      'Call the physician immediately.',
      'Bring the crash cart to Ward 5B.',
      'Start oxygen at 15 liters per minute.',
      'Physician arrived. Preparing bag valve mask ventilation.',
      'Pulse restored to 88 bpm. Vital signs stabilizing.',
    ];

    let phraseIndex = 0;

    const waveTimer = setInterval(() => {
      if (!isListeningRef.current) return;
      const simulatedFreqs = Array.from({ length: 32 }, (_, i) => {
        const centerDist = Math.abs(i - 15.5) / 15.5;
        const envelope = Math.cos(centerDist * (Math.PI / 2.2));
        return Math.floor((Math.random() * 34 + 10) * (0.4 + envelope * 0.9));
      });
      setWaveformFreqs(simulatedFreqs);
      setAudioLevel(Math.floor(Math.random() * 45) + 35);
    }, 80);

    const interval = setInterval(() => {
      if (phraseIndex < demoPhrases.length) {
        const text = demoPhrases[phraseIndex];
        const newSeg: TranscriptSegment = {
          id: `seg-sim-${Date.now()}-${phraseIndex}`,
          timestamp: getFormattedTime(),
          text,
          isFinal: true,
          confidence: 0.98,
        };

        setSegments((prev) => [...prev, newSeg]);
        if (options.onSegmentReceived) {
          options.onSegmentReceived(newSeg);
        }
        phraseIndex++;
      }
    }, 4500);

    simulationIntervalRef.current = interval;

    return () => {
      clearInterval(waveTimer);
      clearInterval(interval);
    };
  }, [options]);

  const startRecording = useCallback(async () => {
    try {
      setErrorMessage(null);
      setConnectionState('CONNECTING');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported in this browser environment.');
      }

      const tokenRes = await fetch('/api/assemblyai/token', { method: 'POST' });
      const tokenData = await tokenRes.json();

      if (tokenData.isSimulated || !tokenData.token) {
        console.info('Starting simulated clinical mode:', tokenData.error);
        startSimulatedStream();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: SAMPLE_RATE,
        },
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate: SAMPLE_RATE });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.6;
      analyserRef.current = analyser;

      const zeroGain = audioCtx.createGain();
      zeroGain.gain.value = 0.0;

      source.connect(analyser);
      source.connect(zeroGain);
      zeroGain.connect(audioCtx.destination);

      const wsUrl = `wss://streaming.assemblyai.com/v3/ws?token=${encodeURIComponent(tokenData.token)}&sample_rate=${SAMPLE_RATE}&speech_model=universal-3-5-pro`;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setConnectionState('LISTENING');
        isListeningRef.current = true;
        setIsSimulatedMode(false);
        animFrameRef.current = requestAnimationFrame(updateAudioVisualizer);

        const scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);
        scriptNodeRef.current = scriptNode;

        scriptNode.onaudioprocess = (e) => {
          if (socket.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBuffer = convertFloat32To16BitPCM(inputData);
            socket.send(pcmBuffer);
          }
        };

        source.connect(scriptNode);
        scriptNode.connect(audioCtx.destination);
      };

      socket.onmessage = (event) => {
        try {
          const res = JSON.parse(event.data);

          if (res.type === 'Begin') {
            console.log('AssemblyAI V3 Session initialized:', res.id);
          } else if (res.type === 'Turn') {
            const text = res.transcript?.trim();
            if (text) {
              if (res.end_of_turn) {
                setCurrentPartial('');
                const newSeg: TranscriptSegment = {
                  id: `seg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  timestamp: getFormattedTime(),
                  text,
                  isFinal: true,
                  confidence: res.end_of_turn_confidence || 0.98,
                };
                setSegments((prev) => [...prev, newSeg]);
                if (options.onSegmentReceived) {
                  options.onSegmentReceived(newSeg);
                }
              } else {
                setCurrentPartial(text);
              }
            }
          } else if (res.type === 'Error') {
            console.error('AssemblyAI WebSocket error:', res.error);
            setErrorMessage(res.error || 'AssemblyAI error occurred.');
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      socket.onerror = (err) => {
        console.error('AssemblyAI WebSocket error:', err);
        setErrorMessage('WebSocket connection error. Switching to simulated local mode.');
        cleanupAudio();
        startSimulatedStream();
      };

      socket.onclose = () => {
        if (connectionState === 'LISTENING') {
          isListeningRef.current = false;
          setConnectionState('DISCONNECTED');
        }
      };
    } catch (err: any) {
      console.error('Error initiating microphone or AssemblyAI connection:', err);
      const msg = err?.message || 'Microphone access denied or connection failed.';
      setErrorMessage(msg);
      if (options.onError) options.onError(msg);
      startSimulatedStream();
    }
  }, [options, updateAudioVisualizer, cleanupAudio, startSimulatedStream, connectionState]);

  const pauseRecording = useCallback(() => {
    if (connectionState === 'LISTENING') {
      isListeningRef.current = false;
      setConnectionState('PAUSED');
      if (audioContextRef.current) audioContextRef.current.suspend();
    } else if (connectionState === 'PAUSED') {
      isListeningRef.current = true;
      setConnectionState('LISTENING');
      if (audioContextRef.current) audioContextRef.current.resume();
      animFrameRef.current = requestAnimationFrame(updateAudioVisualizer);
    }
  }, [connectionState, updateAudioVisualizer]);

  const stopRecording = useCallback(() => {
    isListeningRef.current = false;
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(JSON.stringify({ type: 'Terminate' }));
      } catch (e) {
        // ignore
      }
    }
    cleanupAudio();
    setConnectionState('DISCONNECTED');
  }, [cleanupAudio]);

  const clearSession = useCallback(() => {
    setSegments([]);
    setCurrentPartial('');
    setErrorMessage(null);
  }, []);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  return {
    connectionState,
    segments,
    currentPartial,
    errorMessage,
    isSimulatedMode,
    audioLevel,
    waveformFreqs,
    startRecording,
    pauseRecording,
    stopRecording,
    clearSession,
  };
}
