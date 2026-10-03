import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isRecording: boolean;
  stream?: MediaStream | null;
  height?: number;
  barColor?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isRecording,
  stream,
  height = 56,
  barColor = '#38bdf8',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRecording) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      // Clear canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // Draw quiet baseline
          ctx.fillStyle = '#334155';
          ctx.fillRect(0, canvas.height / 2 - 1, canvas.width, 2);
        }
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let dataArray: Uint8Array | null = null;

    if (stream) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtx = new AudioContextClass();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
      } catch (e) {
        console.warn('AudioContext visualization setup failed, falling back to simulated wave', e);
      }
    }

    let phase = 0;

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const numBars = 32;
      const barWidth = canvas.width / numBars - 2;

      if (analyser && dataArray) {
        (analyser as any).getByteFrequencyData(dataArray);
      }

      for (let i = 0; i < numBars; i++) {
        let barHeight = 4;
        if (dataArray && analyser) {
          const val = dataArray[i % dataArray.length] / 255;
          barHeight = Math.max(4, val * (canvas.height - 8));
        } else {
          // Simulated smooth pulsing sine waves
          const wave = Math.sin(phase + i * 0.3) * 0.5 + 0.5;
          barHeight = 4 + wave * (canvas.height - 12);
        }

        const x = i * (barWidth + 2);
        const y = (canvas.height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#06b6d4');
        gradient.addColorStop(0.5, '#3b82f6');
        gradient.addColorStop(1, '#8b5cf6');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }

      phase += 0.12;
    };

    draw();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
      }
    };
  }, [isRecording, stream]);

  return (
    <div className="w-full flex items-center justify-center overflow-hidden py-1">
      <canvas
        ref={canvasRef}
        width={320}
        height={height}
        className="w-full max-w-sm rounded-lg"
      />
    </div>
  );
};
