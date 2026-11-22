"use client";

import { useEffect, useState } from "react";
import { Bell, X, MessageCircle, Heart, Sparkles, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationPermissionModal({ userId }: { userId: string | null }) {
  const [step, setStep] = useState<"location" | "notifications" | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission | "unsupported">("default");
  const [needsNotifications, setNeedsNotifications] = useState(false);

  useEffect(() => {
    if (!userId || typeof window === "undefined") return;

    async function checkPermissions() {
      // 1. Check Notification permission
      let notifNeeded = false;
      if ("Notification" in window && "serviceWorker" in navigator) {
        const currentPerm = Notification.permission;
        setPermissionState(currentPerm);
        if (currentPerm === "granted") {
          syncExistingSubscription(userId!);
        } else {
          notifNeeded = true;
        }
      } else {
        setPermissionState("unsupported");
      }
      setNeedsNotifications(notifNeeded);

      // 2. Check Location permission
      let locationNeeded = false;
      if ("geolocation" in navigator && "permissions" in navigator) {
        try {
          const locStatus = await navigator.permissions.query({ name: "geolocation" as PermissionName });
          if (locStatus.state === "prompt") {
            locationNeeded = true;
          }
        } catch {
          // Ignore if permissions API is unavailable
        }
      }

      // 3. Show one after the other
      if (locationNeeded) {
        setTimeout(() => setStep("location"), 1000);
      } else if (notifNeeded) {
        setTimeout(() => setStep("notifications"), 1000);
      } else {
        setStep(null);
      }
    }

    checkPermissions();
  }, [userId]);

  async function syncExistingSubscription(uid: string) {
    try {
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) return;

      const registration = await navigator.serviceWorker.ready;
      let sub = await registration.pushManager.getSubscription();
      if (!sub) {
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
        });
      }

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON(), userId: uid }),
      });
    } catch (err) {
      console.warn("[Push] Sync failed:", err);
    }
  }

  const advanceAfterLocation = () => {
    if (needsNotifications) {
      setStep("notifications");
    } else {
      setStep(null);
    }
  };

  const handleAllowLocation = () => {
    if (!("geolocation" in navigator)) {
      advanceAfterLocation();
      return;
    }
    setIsSubscribing(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        localStorage.setItem("univas_location_verified", "true");
        setIsSubscribing(false);
        advanceAfterLocation();
      },
      () => {
        setIsSubscribing(false);
        advanceAfterLocation();
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
    );
  };

  const handleEnableNotifications = async () => {
    if (!userId) return;
    setIsSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);

      if (permission === "granted") {
        await syncExistingSubscription(userId);
        setStep(null);
      }
    } catch (err) {
      console.warn("[Push] Request permission failed:", err);
    } finally {
      setIsSubscribing(false);
    }
  };

  if (!step) {
    return null;
  }

  return (
    <AnimatePresence>
      {step && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-6 shadow-2xl relative overflow-hidden"
          >
            <button
              onClick={() => (step === "location" ? advanceAfterLocation() : setStep(null))}
              aria-label="Close"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {step === "location" ? (
              <>
                <div className="flex flex-col items-center text-center mt-1">
                  <div className="w-14 h-14 rounded-2xl bg-[#E5FF66] flex items-center justify-center shadow-lg shadow-[#E5FF66]/20 mb-4">
                    <MapPin size={26} className="text-black" strokeWidth={2.5} />
                  </div>

                  <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
                    Enable Campus Location
                  </h3>
                  <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                    Peerza uses your location to secure your account and keep your campus experience in sync.
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-2.5">
                  <button
                    onClick={handleAllowLocation}
                    disabled={isSubscribing}
                    className="w-full py-3.5 rounded-2xl bg-[#E5FF66] text-black font-black text-sm shadow-lg shadow-[#E5FF66]/20 hover:brightness-95 active:scale-95 transition-all disabled:opacity-60"
                  >
                    {isSubscribing ? "Checking Location..." : "Allow Location"}
                  </button>
                  <button
                    onClick={advanceAfterLocation}
                    className="w-full py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-bold text-xs hover:text-zinc-900 dark:hover:text-white active:scale-95 transition-all"
                  >
                    Not Now
                  </button>
                </div>
              </>
            ) : (
              <>

            <div className="flex flex-col items-center text-center mt-1">
              <div className="w-14 h-14 rounded-2xl bg-[#E5FF66] flex items-center justify-center shadow-lg shadow-[#E5FF66]/20 mb-4">
                <Bell size={26} className="text-black" strokeWidth={2.5} />
              </div>

              <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
                Turn on Notifications
              </h3>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                Get instant alerts on your phone for new messages, likes, comments, reposts, and campus updates.
              </p>
            </div>

            {/* Phone Notification Preview */}
            <div className="mt-5 p-3.5 rounded-2xl bg-zinc-900 dark:bg-zinc-900/90 border border-zinc-800 shadow-inner text-left">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-black flex items-center justify-center overflow-hidden border border-zinc-700">
                    <Image src="/icon-192x192.png" alt="Peerza" width={20} height={20} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Peerza
                  </span>
                </div>
                <span className="text-[10px] font-medium text-zinc-500">now</span>
              </div>
              <p className="text-[13px] font-bold text-white leading-snug">
                New Message from Peerzites
              </p>
              <p className="text-[12px] text-zinc-300 mt-0.5 line-clamp-1">
                "Hey! Did you see the new post in the feed?"
              </p>
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-zinc-800/80 text-[10px] font-bold text-[#E5FF66]">
                <span className="flex items-center gap-1"><MessageCircle size={11} /> Messages</span>
                <span className="flex items-center gap-1"><Heart size={11} /> Likes</span>
                <span className="flex items-center gap-1"><Sparkles size={11} /> Reposts</span>
              </div>
            </div>

            {permissionState === "denied" ? (
              <div className="mt-5 space-y-3">
                <p className="text-[12px] text-amber-600 dark:text-amber-400 font-medium text-center bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200/50 dark:border-amber-800/40">
                  Notifications are currently blocked in your browser settings. Please allow notifications for Peerza in your browser or phone settings.
                </p>
                <button
                  onClick={() => setStep(null)}
                  className="w-full py-3.5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-sm active:scale-95 transition-transform"
                >
                  Got it
                </button>
              </div>
            ) : (
              <div className="mt-5 flex flex-col gap-2.5">
                <button
                  onClick={handleEnableNotifications}
                  disabled={isSubscribing}
                  className="w-full py-3.5 rounded-2xl bg-[#E5FF66] text-black font-black text-sm shadow-lg shadow-[#E5FF66]/20 hover:brightness-95 active:scale-95 transition-all disabled:opacity-60"
                >
                  {isSubscribing ? "Enabling..." : "Allow Notifications"}
                </button>
                <button
                  onClick={() => setStep(null)}
                  className="w-full py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-bold text-xs hover:text-zinc-900 dark:hover:text-white active:scale-95 transition-all"
                >
                  Not Now
                </button>
              </div>
            )}
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

