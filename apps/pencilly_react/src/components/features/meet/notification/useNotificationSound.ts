'use client';

import { useCallback, useEffect, useRef } from "react";

/**
 * Triggers device vibration if supported.
 * Pattern: array of [vibrate, pause, ...] in ms.
 */
export function triggerVibration(pattern: number[] = [200, 100, 200]) {
  try {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // vibration not available – silent fallback
  }
}

/** Stop any ongoing vibration. */
export function stopVibration() {
  try {
    if ("vibrate" in navigator) {
      navigator.vibrate(0);
    }
  } catch {
    // silent
  }
}

/**
 * Creates a looping ringtone using the Web Audio API.
 * Returns a stop function. Plays a classic "ring-ring ... ring-ring" pattern.
 */
export function startRingtone(): () => void {
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

    // Ring pattern: two short tones, pause, repeat every 2s
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

    // Vibration pattern for ringing: long vibrate with pauses, repeating
    const vibInterval = setInterval(() => {
      triggerVibration([300, 200, 300, 200, 300]);
    }, 2000);
    triggerVibration([300, 200, 300, 200, 300]);

    return () => {
      stopped = true;
      clearInterval(interval);
      clearInterval(vibInterval);
      stopVibration();
      gain.disconnect();
      void ctx.close();
    };
  } catch {
    // Web Audio not available – silent fallback
    return () => {};
  }
}

/**
 * Plays a short notification "ding" sound using the Web Audio API.
 * Also triggers a short vibration pulse.
 */
export function playNotificationTone(): void {
  try {
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.value = 0.12;
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    // First tone – higher pitch ding
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.value = 680;
    osc1.connect(gain);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // Second tone – slightly lower, softer
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = 540;
    osc2.connect(gain);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.25);

    // Auto-close context after tones finish
    setTimeout(() => {
      gain.disconnect();
      void ctx.close();
    }, 500);

    // Short vibration pulse
    triggerVibration([150, 50, 100]);
  } catch {
    // Web Audio not available – silent fallback
  }
}

// ────────────────────────────────────────────
// Hook: manages ringtone lifecycle for a visible call toast
// ────────────────────────────────────────────

export function useRingtone(isActive: boolean) {
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isActive) return;
    stopRef.current = startRingtone();

    return () => {
      stopRef.current?.();
      stopRef.current = null;
    };
  }, [isActive]);

  const stop = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
    stopVibration();
  }, []);

  return stop;
}
