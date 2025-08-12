// app/page.tsx
"use client";
import React from "react";
import { Calendar } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useData } from "@/context/data-context";
import { Button } from "@/components/ui/button";
import { TodayStats } from "@/components/today-stats";
import { TodayWorkoutNutrition } from "@/components/today-workout-nutrition";
import { useNotificationScheduler } from "@/hooks/use-notification-scheduler";



export default function Page() {
  const { user } = useAuth();
  const { activePlan, setGeneratePlanOpen } = useData();

  const { scheduledNotificationsCount} = useNotificationScheduler();
  return (
    <>
      <div>
        <h1 className="text-5xl">
          Hello,{" "}
          <span className="font-extrabold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            {user?.first_name}
          </span>
          !
        </h1>
        {user?.profile?.notification_reminders_enabled &&
          scheduledNotificationsCount > 0 && (
            <div className="text-sm text-muted-foreground mt-2">
              📱 {scheduledNotificationsCount} notifications scheduled for today
            </div>
          )}
      </div>
      

      {activePlan ? (
        <>
          <TodayStats />
          <TodayWorkoutNutrition />
          
        </>
      ) : (
        <div className="text-center py-9 px-9 border border-dashed border-border rounded-lg mb-6">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            You have no active plan
          </h3>
          <p className="text-muted-foreground mb-4">
            Generate your first AI-powered weekly fitness plan.
          </p>
          <Button
            size={"lg"}
            onClick={() => setGeneratePlanOpen(true)}
            className="cyber-button"
          >
            Generate Plan
          </Button>
        </div>
      )}
    </>
  );
};
