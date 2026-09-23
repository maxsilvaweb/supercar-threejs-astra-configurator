import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getAnalyser, isMuted, resumeAudio, setMuted, subscribeMute } from "../../lib/audio-bus";
import { cn } from "@/lib/utils";

function useMuted() {
  const [muted, setMuteState] = useState(isMuted);
  useEffect(() => subscribeMute(setMuteState), []);
  return muted;
}

function SoundWave({ muted }: { muted: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = canvas.getContext("2d");
    if (!draw) return;

    const analyser = getAnalyser();
    const samples = new Uint8Array(analyser.fftSize);
    const width = canvas.width;
    const height = canvas.height;
    let frame = 0;

    const tick = () => {
      analyser.getByteTimeDomainData(samples);
      draw.clearRect(0, 0, width, height);
      draw.beginPath();
      draw.lineWidth = 2;
      draw.strokeStyle = muted ? "rgb(255 255 255 / 0.28)" : "#cfff00";
      draw.lineJoin = "round";
      draw.lineCap = "round";

      const mid = height / 2;
      for (let i = 0; i < samples.length; i += 1) {
        const x = (i / (samples.length - 1)) * width;
        const travel = muted ? 0.08 : 1;
        const y = mid + ((samples[i] - 128) / 128) * (mid - 3) * travel;
        if (i === 0) draw.moveTo(x, y);
        else draw.lineTo(x, y);
      }
      draw.stroke();
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [muted]);

  return (
    <canvas
      ref={canvasRef}
      width={176}
      height={56}
      className="hidden h-7 w-[5.5rem] min-[400px]:block"
      aria-hidden
    />
  );
}

export function SoundPanel({ visible = true }: { visible?: boolean }) {
  const muted = useMuted();

  if (!visible) return null;

  return (
    <div className="pointer-events-auto absolute top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] z-50">
      <div className="surface-carbon flex items-center gap-2 rounded-xl border border-white/12 px-2.5 py-1.5 shadow-lg">
        <SoundWave muted={muted} />
        <button
          type="button"
          className="btn-chrome is-steady grid size-9 place-items-center rounded-lg"
          aria-label={muted ? "Unmute sounds" : "Mute sounds"}
          aria-pressed={muted}
          onClick={() => {
            void resumeAudio();
            if (muted) {
              setMuted(false);
              return;
            }
            window.setTimeout(() => setMuted(true), 90);
          }}
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
      </div>
    </div>
  );
}
