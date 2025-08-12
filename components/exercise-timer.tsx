// components/exercise-timer.tsx
"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, X, Pause } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { beep } from "@/lib/utils"; 
import { Exercise } from "@/interfaces";
import { useData } from "@/context/data-context";
import { handleApiError } from "@/lib/error-handler";
import { speak } from "@/lib/tts";

// function TimerToastContent({
//   exerciseName,
//   type,
//   initialSeconds,
//   onComplete,
//   onCancel,
//   onPause,
//   playSound,
// }: {
//   exerciseName: string;
//   type: string;
//   initialSeconds: number;
//   onComplete: () => void;
//   onCancel: () => void;
//   onPause: () => void;
//   playSound?: boolean;
// }) {
//   const [seconds, setSeconds] = useState(initialSeconds);
//   const [isPaused, setIsPaused] = useState(false);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);

//   const startInterval = () => {
//     if (intervalRef.current) clearInterval(intervalRef.current);
    
//     intervalRef.current = setInterval(() => {
//       setSeconds((prev) => {
//         const next = prev - 1;

//         // Play beeps for the last 3 seconds
//         if (playSound && next > 0 && next <= 3) {
//           beep(880, 200);
//         }

//         if (next <= 0) {
//           clearInterval(intervalRef.current!);
//           // Delay parent update to avoid React warning
//           setTimeout(onComplete, 0);
//           return 0;
//         }

//         return next;
//       });
//     }, 1000);
//   };

//   const pauseInterval = () => {
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
//   };

//   useEffect(() => {
//     if (!isPaused) {
//       startInterval();
//     } else {
//       pauseInterval();
//     }

//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     };
//   }, [isPaused, onComplete, playSound]);

//   const handlePauseToggle = () => {
//     setIsPaused(!isPaused);
//     onPause();
//   };

//   const formatTime = (s: number) =>
//     `${Math.floor(s / 60)
//       .toString()
//       .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

//   return (
//     <div className="p-4 flex flex-col items-center justify-center w-[80vw] gap-5 border">
//       <div className="flex flex-col items-center">
//         <div className="font-semibold text-sm mb-1 text-foreground">
//           {exerciseName} {type === 'rest' ? 'Rest' : 'Exercise'} Timer
//           {isPaused && <span className="ml-2 text-orange-500">(Paused)</span>}
//         </div>
//         <div className={cn(
//           "text-5xl font-mono font-bold",
//           isPaused ? "text-orange-500" : "text-primary"
//         )}>
//           {formatTime(seconds)}
//         </div>
//       </div>
//       <div className="flex gap-2">
//         <Button size="sm" className="glass" variant="outline" onClick={handlePauseToggle}>
//           {isPaused ? (
//             <>
//               <Play className="h-4 w-4 mr-1" /> Resume
//             </>
//           ) : (
//             <>
//               <Pause className="h-4 w-4 mr-1" /> Pause
//             </>
//           )}
//         </Button>
//         <Button size="sm" variant="destructive" onClick={onCancel}>
//           <X className="h-4 w-4 mr-1" /> Cancel
//         </Button>
//       </div>
//     </div>
//   );
// }

function TimerToastContent({
  exerciseName,
  type,
  initialSeconds,
  onComplete,
  onCancel,
  onPause,
  playSound,
}: {
  exerciseName: string;
  type: string;
  initialSeconds: number;
  onComplete: () => void;
  onCancel: () => void;
  onPause: () => void;
  playSound?: boolean;
}) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
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
  };

  const pauseInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!isPaused) {
      startInterval();
    } else {
      pauseInterval();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, onComplete, playSound]);

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
    onPause();
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // Calculate progress percentage (how much time has elapsed)
  const progressPercentage = ((initialSeconds - seconds) / initialSeconds) * 100;
  
  // Determine progress color based on type and remaining time
  const getProgressColor = () => {
    if (isPaused) return "bg-orange-500";
    if (seconds <= 5) return "bg-red-500";
    if (type === 'rest') return "bg-green-500";
    return "bg-primary";
  };

  return (
    <div className="relative p-4 flex flex-col items-center justify-center w-[80vw] gap-5 border border-border rounded-4xl overflow-hidden">
      {/* Progress Background */}
      <div 
        className={cn(
          "absolute inset-0 transition-all duration-1000 ease-linear",
          getProgressColor(),
          isPaused && "animate-pulse"
        )}
        style={{
          width: `${progressPercentage}%`,
          transformOrigin: 'left center'
        }}
      />
      
      {/* Animated border for last 10 seconds */}
      {/* {seconds <= 10 && !isPaused && (
        <div className="absolute inset-0 border-2 border-red-500 animate-pulse rounded-lg" />
      )} */}
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="font-semibold text-sm mb-1 text-foreground">
          {exerciseName} {type === 'rest' ? 'Rest' : 'Exercise'} Timer
          {isPaused && <span className="ml-2 text-orange-500">(Paused)</span>}
        </div>
        <div className={cn(
          "text-5xl font-mono font-bold transition-colors duration-300",
          isPaused ? "text-orange-700" : 
          // seconds <= 10 ? "text-red-500 animate-pulse" :
          "text-primary"
        )}>
          {formatTime(seconds)}
        </div>
      </div>
      
      {/* Progress indicator text */}
      <div className="relative z-10 text-xs text-muted-foreground">
        {Math.round(progressPercentage)}% complete
      </div>
      
      <div className="relative z-10 flex gap-2">
        <Button size="sm" className="glass" variant="outline" onClick={handlePauseToggle}>
          {isPaused ? (
            <>
              <Play className="h-4 w-4 mr-1" /> Resume
            </>
          ) : (
            <>
              <Pause className="h-4 w-4 mr-1" /> Pause
            </>
          )}
        </Button>
        <Button size="sm" variant="destructive" onClick={onCancel}>
          <X className="h-4 w-4 mr-1" /> Cancel
        </Button>
      </div>
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
  const [isPaused, setIsPaused] = useState(false);
  const toastIdRef = useRef<string | number | null>(null);
  const {settings, track} = useData();
  const [etype, setEtype] = useState<'rest'|'exercise'>(type);

  const handleTimerComplete = (comingFrom: 'rest' | 'exercise') => {
    setIsActive(false);
    setIsPaused(false);
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
    setIsPaused(false);
    if (toastIdRef.current) toast.dismiss(toastIdRef.current);
  };

  const handleTimerPause = () => {
    setIsPaused(!isPaused);
  };
  
  const startTimer = (type: 'rest' | 'exercise') => {
    if (isActive) return;
    const periodSeconds = 
    type === 'exercise' ? exercise.duration_mins * 60 : exercise.rest_period_seconds

    setIsActive(true);
    setIsPaused(false);
    toastIdRef.current = toast(
      <TimerToastContent
        key={exercise.name} // ✅ unique key for React list
        type={type}
        exerciseName={exercise.name}
        initialSeconds={periodSeconds}
        onComplete={() => handleTimerComplete(type)}
        onCancel={handleTimerCancel}
        onPause={handleTimerPause}
        playSound={playSound}
      />,
      {  duration: Infinity, 
        position: 'bottom-left',
        className: 'w-full min-w-[85vw]',
        dismissible: false
       }
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

// // components/exercise-timer.tsx
// "use client";

// import { useState, useRef, useEffect, useMemo, useCallback } from "react";
// import { Button } from "@/components/ui/button";
// import { Play, X } from "lucide-react";
// import { toast } from "sonner";
// import { cn } from "@/lib/utils";
// import { beep } from "@/lib/utils"; 
// import { Exercise } from "@/interfaces";
// import { useData } from "@/context/data-context";
// import { handleApiError } from "@/lib/error-handler";
// import { speak } from "@/lib/tts";

// function TimerToastContent({
//   exerciseName,
//   type,
//   initialSeconds,
//   onComplete,
//   onCancel,
//   playSound,
// }: {
//   exerciseName: string;
//   type: string;
//   initialSeconds: number;
//   onComplete: () => void;
//   onCancel: () => void;
//   playSound?: boolean;
// }) {
//   const [seconds, setSeconds] = useState(initialSeconds);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     intervalRef.current = setInterval(() => {
//       setSeconds((prev) => {
//         const next = prev - 1;

//         // Play beeps for the last 3 seconds
//         if (playSound && next > 0 && next <= 3) {
//           beep(880, 200);
//         }

//         if (next <= 0) {
//           clearInterval(intervalRef.current!);
//           // Delay parent update to avoid React warning
//           setTimeout(onComplete, 0);
//           return 0;
//         }

//         return next;
//       });
//     }, 1000);

//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     };
//   }, [onComplete, playSound]);

//   const formatTime = (s: number) =>
//     `${Math.floor(s / 60)
//       .toString()
//       .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

//   return (
//     <div className="p-4 flex items-center justify-between w-full gap-5 border">
//       <div>
//         <div className="font-semibold text-sm mb-1 text-foreground">
//           {exerciseName} {type === 'rest' ? 'Rest' : 'Exercise'} Timer
//         </div>
//         <div className="text-5xl font-mono font-bold text-primary">
//           {formatTime(seconds)}
//         </div>
//       </div>
//       <Button size="sm" variant="destructive" onClick={onCancel}>
//         <X className="h-4 w-4 mr-1" /> Cancel
//       </Button>
//     </div>
//   );
// }

// interface ExerciseTimerProps {
//   type: 'rest'| 'exercise';
//   exercise: Exercise;
//   className?: string;
//   onTimerComplete?: (exerciseName: string) => void;
//   playSound?: boolean;
//   enableTTS?: boolean;
// }

// export function ExerciseTimer({
//   type,
//   exercise,
//   className,
//   onTimerComplete,
//   playSound = true,
//   enableTTS = true,
// }: ExerciseTimerProps) {
//   const [isActive, setIsActive] = useState(false);
//   const toastIdRef = useRef<string | number | null>(null);
//   const {settings, track} = useData();
//   const [etype, setEtype] = useState<'rest'|'exercise'>(type);


//   const handleTimerComplete = (comingFrom: 'rest' | 'exercise') => {
//     setIsActive(false);
//     if (toastIdRef.current) toast.dismiss(toastIdRef.current);

//     // Final beep
//     if (playSound) beep(660, 300);

//     if (enableTTS) {
//       setTimeout(() => {
//         const message = comingFrom === 'exercise'
//           ? `${exercise.name} exercise completed`
//           : `${exercise.name} rest completed`;
//           speak(message, { rate: 1.5, volume: 0.9 });
//       }, 200);
//     }

//     if (onTimerComplete) onTimerComplete(exercise.name);
    
//     if (settings.trackingEnabled && settings.trackAfterRestTimer && (comingFrom === 'rest')) {
//       try {
//         track('track', 'workout', exercise.id, 0, exercise.sets, exercise.calories_to_burn, 0, {showErrorToast: false});
//       } catch (e) {
//       }
//       return;
//     }
//     if (settings.startRestTimerAfterExercise && comingFrom === 'exercise') {
//       setEtype('rest')
//       startTimer('rest')
//     }
//   };

//   const handleTimerCancel = () => {
//     setIsActive(false);
//     if (toastIdRef.current) toast.dismiss(toastIdRef.current);
//   };

  
  
//   const startTimer = (type: 'rest' | 'exercise') => {
//     if (isActive) return;
//     const periodSeconds = 
//     type === 'exercise' ? exercise.duration_mins * 60 : exercise.rest_period_seconds

//     setIsActive(true);
//     toastIdRef.current = toast(
//       <TimerToastContent
//         key={exercise.name} // ✅ unique key for React list
//         type={type}
//         exerciseName={exercise.name}
//         initialSeconds={periodSeconds}
//         onComplete={() => handleTimerComplete(type)}
//         onCancel={handleTimerCancel}
//         playSound={playSound}
//       />,
//       {  duration: Infinity, 
//         position: 'bottom-center', 
//         className: 'w-full min-w-[80%]',
//         dismissible: false
//        }
//     );
//   };

//   return (
//     <Button
//       size="sm"
//       variant="ghost"
//       onClick={() => startTimer(etype)}
//       disabled={isActive}
//       className={cn(
//         `${etype === 'exercise' ? 
//           "text-accent" : 
//           'text-primary hover:bg-primary'}`,
//         "",
//         className
//       )}
//     >
//       <Play className="h-4 w-4 mr-2" />
//       {etype === 'exercise' ? `Ex. (${exercise.duration_mins}min${exercise.duration_mins === 1 ? '' : 's'})` : `Rest (${exercise.rest_period_seconds}sec${exercise.rest_period_seconds === 1 ? '':'s'})`}
//     </Button>
//   );
// }


