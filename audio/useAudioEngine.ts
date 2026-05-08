import { useRef, useState, useEffect, useCallback } from 'react';
import { upeEngine } from '@/engine/UnifiedProcessingEngine';
import { wavefrontExecutor } from '@/engine/WavefrontExecutor';
import { angvCompute } from '@/storage/AngvComputeEngine';
import { DimensionMapper, vectorToDimensions } from '@/storage/DimensionMapper';
import { AudioData, AudioLayer } from '@/types';
import { GENRE_PRESETS, GenrePreset } from './audio-types';
import { GenerativeSequence } from './GenerativeAudioEngine';

export const useAudioEngine = (initialData?: AudioData) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<Map<string, { osc: OscillatorNode; gain: GainNode }[]>>(new Map());
  const analyserRef = useRef<AnalyserNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const masterGainNodeRef = useRef<GainNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const delayNodesRef = useRef<DelayNode[]>([]);
  const sequenceTimersRef = useRef<number[]>([]);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [reverbEnabled, setReverbEnabled] = useState(false);
  const [delayEnabled, setDelayEnabled] = useState(false);
  const [masterGain, setMasterGain] = useState(initialData?.masterGain ?? 0.6);
  const [selectedPreset, setSelectedPreset] = useState<GenrePreset>(initialData?.preset ?? 'quantum');
  const [layers, setLayers] = useState<AudioLayer[]>([]);
  const [filterFreq, setFilterFreq] = useState(initialData?.filterFreq ?? 2000);
  const [midiActive, setMidiActive] = useState(false);

  useEffect(() => {
    const preset = GENRE_PRESETS[selectedPreset];
    setLayers(preset.layers.map((l, i) => ({ ...l, id: `layer-${i}` } as AudioLayer)));
  }, [selectedPreset]);

  // MIDI Input Logic
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(access => {
        setMidiActive(true);
        access.inputs.forEach(input => {
          input.onmidimessage = (msg) => {
             const [status, note, velocity] = msg.data;
             if (status === 144 && velocity > 0) { // Note ON
                if (isPlaying && audioCtxRef.current) {
                   const freq = 440 * Math.pow(2, (note - 69) / 12);
                   playNote(freq, 0.5, velocity / 127);
                }
             }
          };
        });
      });
    }
  }, [isPlaying]);

  const playNote = useCallback((freq: number, duration: number, gainValue: number) => {
    if (!audioCtxRef.current || !masterGainNodeRef.current) return;
    const ctx = audioCtxRef.current;
    
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(gainValue * 0.5, ctx.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(g);
    g.connect(masterGainNodeRef.current);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, []);

  const playBuffer = useCallback((buffer: AudioBuffer) => {
    if (!audioCtxRef.current || !masterGainNodeRef.current) return;
    const ctx = audioCtxRef.current;
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    
    const g = ctx.createGain();
    g.gain.value = masterGain;
    
    source.connect(g);
    g.connect(masterGainNodeRef.current);
    
    source.start();
  }, [masterGain]);

  const playSequence = useCallback((sequence: GenerativeSequence, layerId: string) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    let startTime = ctx.currentTime;

    sequence.notes.forEach((note, i) => {
      const duration = sequence.durations[i];
      const velocity = sequence.velocities[i];
      const time = startTime;
      
      if (note > 0) {
        const timer = window.setTimeout(() => {
          if (isPlaying) playNote(note, duration, velocity);
        }, (time - ctx.currentTime) * 1000);
        sequenceTimersRef.current.push(timer);
      }
      
      startTime += duration;
    });
  }, [isPlaying, playNote]);

  const startAudio = useCallback(async () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyserRef.current = analyser;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    filterNodeRef.current = filter;

    const master = ctx.createGain();
    master.gain.value = isMuted ? 0 : masterGain;
    masterGainNodeRef.current = master;

    // ── COHERENT REVERB: Interference Impulse Response ──────────────────────
    const createCoherentReverb = async () => {
      const convolver = ctx.createConvolver();
      const sampleRate = ctx.sampleRate;
      const length = sampleRate * 3;
      const impulse = ctx.createBuffer(2, length, sampleRate);
      
      const dims = { Phase: Math.random() * Math.PI, Coherence: 0.85 };
      
      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          const decay = Math.exp(-3 * t);
          const interference = Math.sin(t * 20 + dims.Phase) * 0.3;
          const diffusion = dims.Coherence * Math.sin(t * 100 + channel * 0.5) * 0.2;
          channelData[i] = (decay * (Math.random() * 0.5 + 0.5) + interference + diffusion) * 0.5;
        }
      }
      
      convolver.buffer = impulse;
      convolverRef.current = convolver;
      return convolver;
    };

    const createOpticalDelay = () => {
      const delays: DelayNode[] = [];
      const taps = 4;
      for (let i = 0; i < taps; i++) {
        const delayNode = ctx.createDelay(5);
        delayNode.delayTime.value = (0.2 + (i * 0.1));
        const feedback = ctx.createGain();
        feedback.gain.value = 0.3 - (i * 0.05);
        delayNode.connect(feedback);
        feedback.connect(delayNode);
        delays.push(delayNode);
      }
      delayNodesRef.current = delays;
      return delays;
    };

    const convolver = reverbEnabled ? await createCoherentReverb() : null;
    const delayNodes = delayEnabled ? createOpticalDelay() : [];

    // Polyphonic Layer Synthesis
    for (const l of layers) {
      if (!l.active) continue;
      
      const beamId = `BEAM_${l.id}_${Date.now()}`;
      
      // Photonic Logic Simulation (Parallel Dispatch)
      const oscs: { osc: OscillatorNode; gain: GainNode }[] = [];
      
      // Create a 3-oscillator stack for "Quantum Polyphony"
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        
        osc.type = l.type as OscillatorType;
        // Apply slight detuning per sub-oscillator
        const detune = (i - 1) * (l.detune || 5);
        osc.frequency.setValueAtTime(l.frequency, ctx.currentTime);
        osc.detune.setValueAtTime(detune, ctx.currentTime);
        
        g.gain.value = l.gain / 3;
        osc.connect(g);
        g.connect(filter);
        
        if (convolver) {
          g.connect(convolver);
          convolver.connect(master);
        }
        delayNodes.forEach(d => {
          g.connect(d);
          d.connect(master);
        });
        
        osc.start();
        oscs.push({ osc, gain: g });
      }
      
      oscillatorsRef.current.set(l.id, oscs);
    }

    filter.connect(master);
    master.connect(analyser);
    analyser.connect(ctx.destination);

    setIsPlaying(true);
    return analyser;
  }, [layers, filterFreq, isMuted, masterGain, reverbEnabled, delayEnabled]);

  const stopAudio = useCallback(() => {
    oscillatorsRef.current.forEach(stack => stack.forEach(o => o.osc.stop()));
    oscillatorsRef.current.clear();
    sequenceTimersRef.current.forEach(t => clearTimeout(t));
    sequenceTimersRef.current = [];
    convolverRef.current = null;
    delayNodesRef.current = [];
    setIsPlaying(false);
  }, []);

  const updateFilter = useCallback((freq: number) => {
    setFilterFreq(freq);
    if (filterNodeRef.current && audioCtxRef.current) {
      filterNodeRef.current.frequency.setTargetAtTime(freq, audioCtxRef.current.currentTime, 0.05);
    }
  }, []);

  const updateMasterGain = useCallback((val: number) => {
    setMasterGain(val);
    if (masterGainNodeRef.current && audioCtxRef.current) {
       masterGainNodeRef.current.gain.setTargetAtTime(isMuted ? 0 : val, audioCtxRef.current.currentTime, 0.05);
    }
  }, [isMuted]);

  return {
    isPlaying,
    isMuted,
    reverbEnabled,
    delayEnabled,
    masterGain,
    selectedPreset,
    layers,
    filterFreq,
    midiActive,
    analyserRef,
    startAudio,
    stopAudio,
    updateFilter,
    updateMasterGain,
    setReverbEnabled,
    setDelayEnabled,
    setSelectedPreset,
    setIsMuted,
    playSequence,
    playBuffer,
    setLayers
  };
};
