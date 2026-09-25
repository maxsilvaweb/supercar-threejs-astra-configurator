import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { accents, getAccent, setAccent, subscribeAccent, type AccentId } from "../../lib/accent";
import { getWarehouseLights, setWarehouseLights, subscribeWarehouseLights } from "../../lib/warehouse-lights";
import { getAnalyser, getVolume, isMuted, resumeAudio, setMuted, setVolume, subscribeMute, subscribeVolume } from "../../lib/audio-bus";
import {
  isGarageAmbienceEnabled,
  setGarageAmbienceEnabled,
  subscribeGarageAmbience,
} from "../../lib/garage-ambience";
import { isEngineSfxEnabled, setEngineSfxEnabled, subscribeEngineSfx } from "../../lib/engine-loop";
import { isInterfaceSfxEnabled, setInterfaceSfxEnabled, subscribeInterfaceSfx } from "../../lib/play-one-shot-sound";

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

    const colour = { current: getAccent().outline };
    const stopAccent = subscribeAccent((accent) => {
      colour.current = accent.outline;
    });
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
      draw.strokeStyle = muted ? "rgb(255 255 255 / 0.28)" : colour.current;
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
    return () => {
      stopAccent();
      cancelAnimationFrame(frame);
    };
  }, [muted]);

  return (
    <canvas
      ref={canvasRef}
      width={176}
      height={56}
      className="absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}

function useGarageAmbience() {
  const [enabled, setEnabled] = useState(isGarageAmbienceEnabled);
  useEffect(() => subscribeGarageAmbience(setEnabled), []);
  return enabled;
}

function useVolume() {
  const [level, setLevel] = useState(getVolume);
  useEffect(() => subscribeVolume(setLevel), []);
  return level;
}

function useInterfaceSfx() {
  const [enabled, setEnabled] = useState(isInterfaceSfxEnabled);
  useEffect(() => subscribeInterfaceSfx(setEnabled), []);
  return enabled;
}

function useEngineSfx() {
  const [enabled, setEnabled] = useState(isEngineSfxEnabled);
  useEffect(() => subscribeEngineSfx(setEnabled), []);
  return enabled;
}

export function SoundPanel({
  visible = true,
  ambience = false,
  lights = false,
  children,
}: {
  visible?: boolean;
  ambience?: boolean;
  lights?: boolean;
  children?: ReactNode;
}) {
  const muted = useMuted();
  const level = useVolume();
  const ambienceOn = useGarageAmbience();
  const interfaceOn = useInterfaceSfx();
  const engineOn = useEngineSfx();

  if (!visible) return null;

  return (
    <div className="pointer-events-auto absolute top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] z-50 flex w-max flex-col items-center gap-2">
      <div className="flex w-max flex-col items-stretch gap-2">
      <div className="surface-carbon flex w-max flex-col gap-2 rounded-xl border border-white/12 px-2 py-2 shadow-lg">
        <div className="flex items-center gap-2 px-0.5">
          <div className="relative h-7 min-w-0 flex-1">
            <SoundWave muted={muted} />
          </div>
          <button
            type="button"
            className="btn-chrome is-steady grid size-9 shrink-0 place-items-center rounded-lg"
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
        <div className="sound-console-well">
          <div className="sound-console-row">
            <span className="text-[0.7rem] tracking-wide whitespace-nowrap text-white/80">Volume</span>
            <Slider
              className="w-28"
              min={0}
              max={100}
              step={1}
              value={[Math.round(level * 100)]}
              aria-label="Volume"
              onValueChange={(next) => {
                const amount = next[0];
                if (amount === undefined) return;
                void resumeAudio();
                setVolume(amount / 100);
              }}
            />
          </div>
          <div className="sound-console-row">
            <span className="text-[0.7rem] tracking-wide whitespace-nowrap text-white/80">Interface SFX</span>
            <Switch
              size="sm"
              checked={interfaceOn}
              aria-label="Interface SFX"
              onCheckedChange={(checked) => {
                void resumeAudio();
                setInterfaceSfxEnabled(checked);
              }}
            />
          </div>
          <div className="sound-console-row">
            <span className="text-[0.7rem] tracking-wide whitespace-nowrap text-white/80">Engine SFX</span>
            <Switch
              size="sm"
              checked={engineOn}
              aria-label="Engine SFX"
              onCheckedChange={(checked) => {
                void resumeAudio();
                setEngineSfxEnabled(checked);
              }}
            />
          </div>
          {ambience ? (
            <div className="sound-console-row">
              <span className="text-[0.7rem] tracking-wide whitespace-nowrap text-white/80">Garage Ventilation SFX</span>
              <Switch
                size="sm"
                checked={ambienceOn}
                aria-label="Garage Ventilation SFX"
                onCheckedChange={(checked) => {
                  void resumeAudio();
                  setGarageAmbienceEnabled(checked);
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
      <AccentPanel />
      {lights ? <LightPanel /> : null}
      </div>
      {children}
    </div>
  );
}

function useWarehouseLights() {
  const [level, setLevel] = useState(getWarehouseLights);
  useEffect(() => subscribeWarehouseLights(setLevel), []);
  return level;
}

function LightPanel() {
  const level = useWarehouseLights();

  return (
    <div className="surface-carbon w-0 min-w-full rounded-xl border border-white/12 px-2 py-2 shadow-lg">
      <div className="sound-console-well">
        <div className="sound-console-row">
          <span className="text-[0.7rem] tracking-wide whitespace-nowrap text-white/80">Lights</span>
          <Slider
            className="w-28"
            min={0}
            max={100}
            step={1}
            value={[Math.round(level * 100)]}
            aria-label="Warehouse lights"
            onValueChange={(next) => {
              const amount = next[0];
              if (amount === undefined) return;
              setWarehouseLights(amount / 100);
            }}
          />
        </div>
      </div>
    </div>
  );
}

function useAccentId() {
  const [id, setId] = useState<AccentId>(getAccent().id);
  useEffect(() => subscribeAccent((accent) => setId(accent.id)), []);
  return id;
}

function AccentPanel() {
  const id = useAccentId();

  return (
    <div className="surface-carbon w-0 min-w-full rounded-xl border border-white/12 px-2 py-2 shadow-lg">
      <div className="sound-console-well">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[0.7rem] tracking-wide whitespace-nowrap text-white/80">Accent</span>
          <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Accent colour">
            {accents.map((accent) => (
              <button
                key={accent.id}
                type="button"
                role="radio"
                aria-checked={id === accent.id}
                aria-label={accent.label}
                title={accent.label}
                className="grid size-5 place-items-center rounded-full border border-white/30"
                style={{
                  background: accent.swatch ?? accent.color,
                  boxShadow: id === accent.id ? "0 0 0 2px #111, 0 0 0 3px #fff" : undefined,
                }}
                onClick={() => setAccent(accent.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
