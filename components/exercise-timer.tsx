// components/exercise-timer.tsx
"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { beep } from "@/lib/utils"; 
import { Exercise } from "@/interfaces";
import { useData } from "@/context/data-context";
import { handleApiError } from "@/lib/error-handler";
import { speak } from "@/lib/tts";

function TimerToastContent({
  exerciseName,
  type,
  initialSeconds,
  onComplete,
  onCancel,
  playSound,
}: {
  exerciseName: string;
  type: string;
  initialSeconds: number;
  onComplete: () => void;
  onCancel: () => void;
  playSound?: boolean;
}) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        const next = prev - 1;

        // Play beeps for the last 3 seconds
        if (playSound && next > 0 && next <= 3) {
          beep(880, 200);
        }

        if (next <= 0) {
          clearInterval(intervalRef.current!);
          // Delay parent update to avoid React warning
          setTimeout(onComplete, 0);
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onComplete, playSound]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="p-4 flex items-center justify-between w-full gap-5">
      <div>
        <div className="font-semibold text-sm mb-1 text-foreground">
          {exerciseName} {type === 'rest' ? 'Rest' : 'Exercise'} Timer
        </div>
        <div className="text-5xl font-mono font-bold text-primary">
          {formatTime(seconds)}
        </div>
      </div>
      <Button size="sm" variant="destructive" onClick={onCancel}>
        <X className="h-4 w-4 mr-1" /> Cancel
      </Button>
    </div>
  );
}

interface ExerciseTimerProps {
  type: 'rest'| 'exercise';
  exercise: Exercise;
  className?: string;
  onTimerComplete?: (exerciseName: string) => void;
  playSound?: boolean;
  enableTTS?: boolean;
}

export function ExerciseTimer({
  type,
  exercise,
  className,
  onTimerComplete,
  playSound = true,
  enableTTS = true,
}: ExerciseTimerProps) {
  const [isActive, setIsActive] = useState(false);
  const toastIdRef = useRef<string | number | null>(null);
  const {settings, track} = useData();
  const [etype, setEtype] = useState<'rest'|'exercise'>(type);


  const handleTimerComplete = (comingFrom: 'rest' | 'exercise') => {
    setIsActive(false);
    if (toastIdRef.current) toast.dismiss(toastIdRef.current);

    // Final beep
    if (playSound) beep(660, 300);

    if (enableTTS) {
      setTimeout(() => {
        const message = comingFrom === 'exercise'
          ? `${exercise.name} exercise completed`
          : `${exercise.name} rest completed`;
          speak(message, { rate: 1.5, volume: 0.9 });
      }, 200);
    }

    if (onTimerComplete) onTimerComplete(exercise.name);
    
    if (settings.trackingEnabled && settings.trackAfterRestTimer && (comingFrom === 'rest')) {
      try {
        track('track', 'workout', exercise.id, 0, exercise.sets, exercise.calories_to_burn, 0, {showErrorToast: false});
      } catch (e) {
      }
      return;
    }
    if (settings.startRestTimerAfterExercise && comingFrom === 'exercise') {
      setEtype('rest')
      startTimer('rest')
    }
  };

  const handleTimerCancel = () => {
    setIsActive(false);
    if (toastIdRef.current) toast.dismiss(toastIdRef.current);
  };

  
  
  const startTimer = (type: 'rest' | 'exercise') => {
    if (isActive) return;
    const periodSeconds = 
    type === 'exercise' ? exercise.duration_mins * 60 : exercise.rest_period_seconds

    setIsActive(true);
    toastIdRef.current = toast(
      <TimerToastContent
        key={exercise.name} // ✅ unique key for React list
        type={type}
        exerciseName={exercise.name}
        initialSeconds={periodSeconds}
        onComplete={() => handleTimerComplete(type)}
        onCancel={handleTimerCancel}
        playSound={playSound}
      />,
      { unstyled: true, duration: Infinity }
    );
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => startTimer(etype)}
      disabled={isActive}
      className={cn(
        `${etype === 'exercise' ? 
          "text-accent" : 
          'text-primary hover:bg-primary'}`,
        "",
        className
      )}
    >
      <Play className="h-4 w-4 mr-2" />
      {etype === 'exercise' ? `Ex. (${exercise.duration_mins}min${exercise.duration_mins === 1 ? '' : 's'})` : `Rest (${exercise.rest_period_seconds}sec${exercise.rest_period_seconds === 1 ? '':'s'})`}
    </Button>
  );
}


