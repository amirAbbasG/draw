import { useCallback, useEffect, useRef } from "react";

import { useShallow } from "zustand/react/shallow";

import { setCallData } from "@/stores/zustand/collaborate/actions";
import { useCollaborateStore } from "@/stores/zustand/collaborate/collaborate-store";
import { useCustomSearchParams } from "@/hooks/useCustomSearchParams";
import { CALL_SESSION_KEY } from "@/constants/keys";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { Button } from "@/components/ui/button";

const AUTO_DENY_TIMEOUT = 30_000;

/**
 * Creates a looping ringtone using the Web Audio API.
 * Returns a stop function.
 */
function startRingtone(): () => void {
  try {
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.value = 0.15;
    gain.connect(ctx.destination);

    let stopped = false;

    const playTone = (freq: number, start: number, dur: number) => {
      if (stopped) return;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      osc.start(start);
      osc.stop(start + dur);
    };

    // Ring pattern: two short tones, pause, repeat every 2 s
    const scheduleRing = () => {
      if (stopped) return;
      const now = ctx.currentTime;
      playTone(440, now, 0.25);
      playTone(580, now + 0.3, 0.25);
      playTone(440, now + 0.7, 0.25);
      playTone(580, now + 1.0, 0.25);
    };

    scheduleRing();
    const interval = setInterval(scheduleRing, 2000);

    return () => {
      stopped = true;
      clearInterval(interval);
      gain.disconnect();
      void ctx.close();
    };
  } catch {
    // Web Audio not available – silent fallback
    return () => {};
  }
}

export default function IncomingCallPopup() {
  const t = useTranslations("call");
  const callData = useCollaborateStore(
    useShallow((state) => state.callData),
  );
  const { searchParams, setSearchParams } = useCustomSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopRingtoneRef = useRef<(() => void) | null>(null);

  const isVisible = !!callData;

  // --- ringtone ---
  useEffect(() => {
    if (!isVisible) return;

    stopRingtoneRef.current = startRingtone();

    return () => {
      stopRingtoneRef.current?.();
      stopRingtoneRef.current = null;
    };
  }, [isVisible]);

  const stopRingtone = useCallback(() => {
    stopRingtoneRef.current?.();
    stopRingtoneRef.current = null;
  }, []);

  // --- auto-deny after 30 s ---
  useEffect(() => {
    if (!isVisible) return;

    timerRef.current = setTimeout(() => {
      stopRingtone();
      setCallData(null);
    }, AUTO_DENY_TIMEOUT);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isVisible, stopRingtone]);

  const handleAccept = useCallback(() => {
    if (!callData) return;
    stopRingtone();
    if (timerRef.current) clearTimeout(timerRef.current);

    searchParams.set(CALL_SESSION_KEY, callData.destinationId);
    setSearchParams(searchParams);

    setCallData(null);
  }, [callData, searchParams, setSearchParams, stopRingtone]);

  const handleDeny = useCallback(() => {
    stopRingtone();
    if (timerRef.current) clearTimeout(timerRef.current);
    setCallData(null);
  }, [stopRingtone]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pointer-events-none">
      {/* backdrop */}
      <div className="absolute inset-0 bg-overlay/10 backdrop-blur-sm pointer-events-auto" />

      {/* card */}
      <div
        className={cn(
          "relative pointer-events-auto mt-8 w-full max-w-sm mx-4",
          "rounded-lg border border-separator bg-background-lighter shadow-modal",
          "animate-in slide-in-from-top-4 fade-in duration-300",
          "col gap-4 p-5",
        )}
      >
        {/* pulse ring decoration */}
        <div className="mx-auto relative flex items-center justify-center">
          <span className="absolute size-16 rounded-full bg-success/20 animate-ping" />
          <span className="absolute size-16 rounded-full bg-success/10" />
          <div className="relative size-14 rounded-full bg-success/20 centered-col">
            <AppIcon
              icon={sharedIcons.call}
              className="size-7 text-success"
            />
          </div>
        </div>

        {/* info */}
        <div className="col items-center gap-1 text-center">
          <AppTypo variant="headingXS" type="h3">
            {t("incoming_call")}
          </AppTypo>
          <AppTypo variant="small" color="secondary">
            <span className="font-semibold text-foreground">
              {callData.createdBy.name}
            </span>{" "}
            {t("calling_you")}
          </AppTypo>
        </div>

        {/* actions */}
        <div className="row gap-3">
          <Button
            variant="outline"
            color="danger"
            className="flex-1 gap-2"
            onClick={handleDeny}
            icon={sharedIcons.call_end}
          >
            {t("deny")}
          </Button>

          <Button
            className="flex-1 gap-2"
            color="success"
            onClick={handleAccept}
            icon={sharedIcons.call}
          >
            {t("accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}
