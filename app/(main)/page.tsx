// app/u/page.tsx
"use client";
import React from "react";
import { Calendar } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useData } from "@/context/data-context";
import { Button } from "@/components/ui/button";
import { TodayStats } from "@/components/today-stats";
import { TodayWorkoutNutrition } from "@/components/today-workout-nutrition";
import { ProgressCalendar } from "@/components/progress-calendar";
import CalorieTrackingRadial from "@/components/calorie-tracking-radial";
import MacronutrientBreakdown from "@/components/macro-nutrient-breakdown";
import WeeklyWorkoutCompletion from "@/components/weekly-workout-completion";



import { useState, useEffect } from "react";
import { subscribeUser, unsubscribeUser, sendNotification } from "../actions";
import { useNotificationScheduler } from "@/hooks/use-notification-scheduler";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    });
    setSubscription(sub);
    const serializedSub = JSON.parse(JSON.stringify(sub));
    await subscribeUser(serializedSub);
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser();
  }

  async function sendTestNotification() {
    if (subscription) {
      await sendNotification(message);
      setMessage("");
    }
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  }

  return (
    <div>
      <h3>Push Notifications</h3>
      {subscription ? (
        <>
          <p>You are subscribed to push notifications.</p>
          <button onClick={unsubscribeFromPush}>Unsubscribe</button>
          <input
            type="text"
            placeholder="Enter notification message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={sendTestNotification}>Send Test</button>
        </>
      ) : (
        <>
          <p>You are not subscribed to push notifications.</p>
          <button onClick={subscribeToPush}>Subscribe</button>
        </>
      )}
    </div>
  );
}

function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    );

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  if (isStandalone) {
    return null; // Don't show install button if already installed
  }

  return (
    <div>
      <h3>Install App</h3>
      <button>Add to Home Screen</button>
      {isIOS && (
        <p>
          To install this app on your iOS device, tap the share button
          <span role="img" aria-label="share icon">
            {" "}
            ⎋{" "}
          </span>
          and then "Add to Home Screen"
          <span role="img" aria-label="plus icon">
            {" "}
            ➕{" "}
          </span>
          .
        </p>
      )}
    </div>
  );
}



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
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            <ProgressCalendar className="sm:col-span-3 md:col-span-4" />
            <CalorieTrackingRadial className="sm:col-span-2" />
            <MacronutrientBreakdown className="sm:col-span-2" />
            <WeeklyWorkoutCompletion className="sm:col-span-2 md:col-span-4 lg:col-span-4" />
          </div>
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
