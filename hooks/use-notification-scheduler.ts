import { useEffect } from "react";
import { useData } from "@/context/data-context";
import { useAuth } from "@/context/auth-context";
import { 
  notificationScheduler, 
  scheduleMealNotifications, 
  scheduleWorkoutNotifications 
} from "@/lib/notification-scheduler";

export function useNotificationScheduler() {
  const { user } = useAuth();
  const { todayNutrition, todayWorkout, settings } = useData();

  useEffect(() => {
    // Only schedule if user has notifications enabled
    if (!user?.profile?.notification_reminders_enabled) {
      return;
    }

    // Cancel existing notifications
    notificationScheduler.cancelAllNotifications();

    // Schedule meal notifications
    if (todayNutrition && settings.times) {
      scheduleMealNotifications(
        {
          breakfast_time: settings.times.breakfast || "08:00:00",
          lunch_time: settings.times.lunch || "12:00:00", 
          snack_time: settings.times.snack || "14:00:00",
          dinner_time: settings.times.dinner || "18:00:00"
        },
        todayNutrition.meals
      );
    }

    // Schedule workout notification
    if (todayWorkout && settings.times?.workout) {
      scheduleWorkoutNotifications(
        settings.times.workout,
        todayWorkout
      );
    }

    // Cleanup function to cancel notifications when component unmounts
    return () => {
      notificationScheduler.cancelAllNotifications();
    };
  }, [
    user?.profile?.notification_reminders_enabled,
    todayNutrition,
    todayWorkout,
    settings.times
  ]);

  return {
    scheduledNotificationsCount: notificationScheduler.getScheduledCount(),
    cancelAllNotifications: () => notificationScheduler.cancelAllNotifications()
  };
}