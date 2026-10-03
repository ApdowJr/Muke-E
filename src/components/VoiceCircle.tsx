import React, { useEffect, useRef } from 'react';

interface VoiceCircleProps {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  audioStream?: MediaStream | null;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const VoiceCircle: React.FC<VoiceCircleProps> = ({
  isListening,
  isSpeaking,
  isThinking,
  audioStream,
  onClick,
  size = 'md',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  const sizePixels = size === 'sm' ? 80 : size === 'lg' ? 160 : 120;
  const radius = sizePixels * 0.35;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array | null = null;

    if (audioStream && isListening) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtx = new AudioContextClass();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        const source = audioCtx.createMediaStreamSource(audioStream);
        source.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
      } catch (e) {}
    }

    let phase = 0;

    const render = () => {
      animRef.current = requestAnimationFrame(render);
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      let volume = 0;
      if (analyser && dataArray) {
        (analyser as any).getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        volume = (sum / dataArray.length / 255) * 22;
      }

      const currentR = radius + volume;

      // Soft ambient glow
      const glowGrad = ctx.createRadialGradient(cx, cy, currentR * 0.4, cx, cy, currentR * 1.6);
      if (isListening) {
        glowGrad.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
        glowGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      } else if (isSpeaking) {
        glowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
        glowGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      } else if (isThinking) {
        glowGrad.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
        glowGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
      } else {
        glowGrad.addColorStop(0, 'rgba(37, 99, 235, 0.25)');
        glowGrad.addColorStop(1, 'rgba(37, 99, 235, 0)');
      }
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, currentR * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Fluid ring
      if (isListening || isSpeaking) {
        ctx.strokeStyle = isListening ? 'rgba(248, 113, 113, 0.4)' : 'rgba(125, 211, 252, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const pulseR = currentR + Math.sin(phase * 3) * 6 + 6;
        ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Main gradient circle
      const grad = ctx.createLinearGradient(cx - currentR, cy - currentR, cx + currentR, cy + currentR);
      if (isListening) {
        grad.addColorStop(0, '#f43f5e');
        grad.addColorStop(1, '#e11d48');
      } else if (isSpeaking) {
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(1, '#2563eb');
      } else if (isThinking) {
        grad.addColorStop(0, '#c084fc');
        grad.addColorStop(1, '#6366f1');
      } else {
        grad.addColorStop(0, '#3b82f6');
        grad.addColorStop(1, '#1d4ed8');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, currentR, 0, Math.PI * 2);
      ctx.fill();

      // Specular highlight
      ctx.beginPath();
      ctx.ellipse(cx - currentR * 0.25, cy - currentR * 0.3, currentR * 0.35, currentR * 0.2, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fill();

      phase += 0.05;
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (audioCtx && audioCtx.state !== 'closed') audioCtx.close().catch(() => {});
    };
  }, [isListening, isSpeaking, isThinking, audioStream, radius]);

  return (
    <div
      onClick={onClick}
      className="relative flex items-center justify-center cursor-pointer select-none transition-transform hover:scale-105 active:scale-95"
    >
      <canvas
        ref={canvasRef}
        width={sizePixels}
        height={sizePixels}
        className="pointer-events-none drop-shadow-xl"
      />
    </div>
  );
};
