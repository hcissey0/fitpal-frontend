import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { subscribeUser, unsubscribeUser } from "@/app/actions";
import { notificationScheduler } from "./notification-scheduler";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// utils/beep.js
export function beep(frequency = 440, duration = 200) {
  const audioCtx = new (window.AudioContext || (window as any)["webkitAudioContext"])();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = 'sine'; // sine, square, sawtooth, triangle
  oscillator.frequency.value = frequency;

  oscillator.start();
  gainNode.gain.setValueAtTime(1, audioCtx.currentTime);

  // Stop after duration
  oscillator.stop(audioCtx.currentTime + duration / 1000);
}



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

export async function requestNotificationPermissionAndSubscribe(): Promise<boolean> {
  try {
    // Check if push notifications are supported
    if (!("serviceWorker" in navigator && "PushManager" in window)) {
      console.warn("Push notifications are not supported");
      return false;
    }

    // Request notification permission
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return false;
    }

    // Register service worker if not already registered
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });

    await navigator.serviceWorker.ready;

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Subscribe to push notifications
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      // Send subscription to server
      const serializedSub = JSON.parse(JSON.stringify(subscription));
      await subscribeUser(serializedSub);
    }

    return true;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
}

export async function unsubscribeFromPushNotifications(): Promise<void> {
  try {

    // CAncel all notifications
    notificationScheduler.cancelAllNotifications();
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          await unsubscribeUser();
        }
      }
    }
  } catch (error) {
    console.error("Error unsubscribing from push notifications:", error);
  }
}