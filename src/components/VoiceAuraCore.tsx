import React, { useEffect, useRef } from 'react';

export type VoiceAuraState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface VoiceAuraCoreProps {
  state: VoiceAuraState;
  audioStream?: MediaStream | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
}

export const VoiceAuraCore: React.FC<VoiceAuraCoreProps> = ({
  state,
  audioStream,
  size = 'md',
  onClick,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  const dimensions = {
    sm: { width: 90, height: 90, orbR: 26 },
    md: { width: 140, height: 140, orbR: 40 },
    lg: { width: 220, height: 220, orbR: 64 },
    xl: { width: 300, height: 300, orbR: 90 },
  }[size];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let dataArray: Uint8Array | null = null;

    if (audioStream && state === 'listening') {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtx = new AudioContextClass();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source = audioCtx.createMediaStreamSource(audioStream);
        source.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
      } catch (e) {
        // fallback
      }
    }

    let phase = 0;

    const render = () => {
      animRef.current = requestAnimationFrame(render);
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      let volumeBoost = 0;
      if (analyser && dataArray) {
        (analyser as any).getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        volumeBoost = (sum / dataArray.length / 255) * 28;
      }

      // Base radius calculation
      const baseR = dimensions.orbR + volumeBoost;

      // 1. Outermost Ambient Halo Glow
      const ambientGrad = ctx.createRadialGradient(cx, cy, baseR * 0.4, cx, cy, baseR * 1.8);
      if (state === 'listening') {
        ambientGrad.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
        ambientGrad.addColorStop(0.6, 'rgba(244, 63, 94, 0.15)');
        ambientGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (state === 'speaking') {
        ambientGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
        ambientGrad.addColorStop(0.5, 'rgba(129, 140, 248, 0.2)');
        ambientGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (state === 'thinking') {
        ambientGrad.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
        ambientGrad.addColorStop(0.6, 'rgba(59, 130, 246, 0.2)');
        ambientGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        // idle
        ambientGrad.addColorStop(0, 'rgba(14, 165, 233, 0.25)');
        ambientGrad.addColorStop(0.7, 'rgba(99, 102, 241, 0.08)');
        ambientGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      ctx.fillStyle = ambientGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // 2. Harmonic Fluid Resonance Rings
      const ringCount = state === 'listening' ? 3 : state === 'speaking' ? 4 : 2;
      for (let r = 0; r < ringCount; r++) {
        const ringOffset = (phase * (1.2 + r * 0.4)) % 1;
        const currentRingR = baseR + ringOffset * (baseR * 0.7);
        const ringAlpha = Math.max(0, (1 - ringOffset) * (state === 'idle' ? 0.25 : 0.6));

        ctx.strokeStyle =
          state === 'listening'
            ? `rgba(244, 63, 94, ${ringAlpha})`
            : state === 'speaking'
            ? `rgba(56, 189, 248, ${ringAlpha})`
            : state === 'thinking'
            ? `rgba(168, 85, 247, ${ringAlpha})`
            : `rgba(56, 189, 248, ${ringAlpha})`;

        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, currentRingR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. Fluid Warped Core Orb
      const numPoints = 64;
      ctx.beginPath();
      for (let i = 0; i <= numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        let wobble = Math.sin(angle * 4 + phase * 2.5) * (state === 'speaking' ? 5 : state === 'listening' ? 4 : 2);
        if (state === 'thinking') {
          wobble = Math.cos(angle * 6 + phase * 4) * 6;
        }
        const pointR = baseR + wobble;
        const x = cx + Math.cos(angle) * pointR;
        const y = cy + Math.sin(angle) * pointR;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Core Gradient
      const coreGrad = ctx.createLinearGradient(cx - baseR, cy - baseR, cx + baseR, cy + baseR);
      if (state === 'listening') {
        coreGrad.addColorStop(0, '#f43f5e');
        coreGrad.addColorStop(0.5, '#e11d48');
        coreGrad.addColorStop(1, '#9f1239');
      } else if (state === 'speaking') {
        coreGrad.addColorStop(0, '#38bdf8');
        coreGrad.addColorStop(0.4, '#3b82f6');
        coreGrad.addColorStop(1, '#6366f1');
      } else if (state === 'thinking') {
        coreGrad.addColorStop(0, '#c084fc');
        coreGrad.addColorStop(0.5, '#818cf8');
        coreGrad.addColorStop(1, '#3b82f6');
      } else {
        coreGrad.addColorStop(0, '#06b6d4');
        coreGrad.addColorStop(0.5, '#2563eb');
        coreGrad.addColorStop(1, '#4f46e5');
      }

      ctx.fillStyle = coreGrad;
      ctx.fill();

      // 4. Refractive Specular Glass Highlight
      ctx.beginPath();
      ctx.ellipse(cx - baseR * 0.28, cy - baseR * 0.32, baseR * 0.42, baseR * 0.24, -Math.PI / 4, 0, Math.PI * 2);
      const specGrad = ctx.createLinearGradient(cx - baseR * 0.5, cy - baseR * 0.5, cx, cy);
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      specGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.15)');
      specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = specGrad;
      ctx.fill();

      phase += state === 'speaking' ? 0.08 : state === 'listening' ? 0.07 : 0.04;
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (audioCtx && audioCtx.state !== 'closed') audioCtx.close().catch(() => {});
    };
  }, [state, audioStream, dimensions]);

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center cursor-pointer select-none transition-transform hover:scale-[1.03] active:scale-[0.97] ${className}`}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="pointer-events-none drop-shadow-[0_0_24px_rgba(56,189,248,0.3)]"
      />
    </div>
  );
};
