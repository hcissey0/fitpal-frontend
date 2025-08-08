import { sendNotification } from "@/app/actions";
import { Meal, WorkoutDay } from "@/interfaces";

interface NotificationSchedule {
  id: string;
  title: string;
  body: string;
  scheduledTime: Date;
  type: "meal" | "workout";
  mealType?: "breakfast" | "lunch" | "snack" | "dinner";
}

class NotificationScheduler {
  private scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();

  scheduleNotification(schedule: NotificationSchedule) {
    const now = new Date();
    const delay = schedule.scheduledTime.getTime() - now.getTime();

    // Only schedule if the time is in the future
    if (delay > 0) {
      const timeoutId = setTimeout(async () => {
        try {
          await sendNotification(
            JSON.stringify({
              title: schedule.title,
              body: schedule.body,
              icon: "/icon.png",
            })
          );

          // Remove from scheduled notifications after sending
          this.scheduledNotifications.delete(schedule.id);
        } catch (error) {
          console.error("Failed to send notification:", error);
        }
      }, delay);

      // Store the timeout ID so we can cancel if needed
      this.scheduledNotifications.set(schedule.id, timeoutId);

      console.log(
        `Notification scheduled for ${schedule.scheduledTime.toLocaleString()}: ${
          schedule.title
        }`
      );
    }
  }

  cancelNotification(id: string) {
    const timeoutId = this.scheduledNotifications.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledNotifications.delete(id);
      console.log(`Cancelled notification: ${id}`);
    }
  }

  cancelAllNotifications() {
    this.scheduledNotifications.forEach((timeoutId, id) => {
      clearTimeout(timeoutId);
      console.log(`Cancelled notification: ${id}`);
    });
    this.scheduledNotifications.clear();
  }

  getScheduledCount(): number {
    return this.scheduledNotifications.size;
  }
}

export const notificationScheduler = new NotificationScheduler();

// Helper function to create meal notifications
export function scheduleMealNotifications(
  mealTimes: {
    breakfast_time: string;
    lunch_time: string;
    snack_time: string;
    dinner_time: string;
  },
  todayMeals: Array<Meal>
) {
  const today = new Date();
  const mealEmojis = {
    breakfast: "🌅",
    lunch: "☀️",
    snack: "🍎",
    dinner: "🌙",
  };

  Object.entries(mealTimes).forEach(([mealKey, timeString]) => {
    const mealType = mealKey.replace("_time", "") as keyof typeof mealEmojis;
    const meal = todayMeals.find((m) => m.meal_type === mealType);

    if (meal && timeString) {
      const [hours, minutes] = timeString.split(":").map(Number);
      const scheduledTime = new Date(today);
      scheduledTime.setHours(hours, minutes, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (scheduledTime <= new Date()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      notificationScheduler.scheduleNotification({
        id: `meal-${meal.id}-${mealType}`,
        title: `${mealEmojis[mealType]} Time for ${
          mealType.charAt(0).toUpperCase() + mealType.slice(1)
        }!`,
        body: `${meal.description} (${meal.calories} calories) is ready to be logged.`,
        scheduledTime,
        type: "meal",
        mealType,
      });
    }
  });
}

// Helper function to create workout notifications
export function scheduleWorkoutNotifications(
  workoutTime: string,
  todayWorkout: WorkoutDay
) {
  if (!workoutTime || todayWorkout.is_rest_day) return;

  const today = new Date();
  const [hours, minutes] = workoutTime.split(":").map(Number);
  const scheduledTime = new Date(today);
  scheduledTime.setHours(hours, minutes, 0, 0);

  // If the time has passed today, schedule for tomorrow
  if (scheduledTime <= new Date()) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  notificationScheduler.scheduleNotification({
    id: `workout-${todayWorkout.id}`,
    title: "💪 Time to Workout!",
    body: `${todayWorkout.description} - ${todayWorkout.exercises.length} exercises waiting for you.\n\n${todayWorkout.exercises.map((e) => `- ${e.name} (${e.sets} of ${e.reps})\n`).join()}`,
    scheduledTime,
    type: "workout",
  });
}
