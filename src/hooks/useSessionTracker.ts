"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export function useSessionTracker() {
  const supabase = createClient();
  const [isLocationMandatory, setIsLocationMandatory] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"pending" | "granted" | "denied">("pending");

  useEffect(() => {
    const trackSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Generate/Retrieve a stable Logical Session ID for this browser
      let sessionId = localStorage.getItem("univas_session_id");
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem("univas_session_id", sessionId);
      }

      // 2. Detect Device Info
      const ua = navigator.userAgent;
      const platform = (navigator as any).platform || "";
      let deviceName = "Unknown Device";
      
      if (/iPhone/i.test(ua)) deviceName = "iPhone";
      else if (/Android/i.test(ua)) deviceName = "Android Device";
      else if (/Mac/i.test(platform) || /Macintosh/i.test(ua)) deviceName = "MacBook Pro";
      else if (/Win/i.test(platform) || /Windows/i.test(ua)) deviceName = "Windows PC";

      // 3. Mandatory Location
      if (!("geolocation" in navigator)) {
        console.warn("Geolocation not supported");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setLocationStatus("granted");
          const { latitude, longitude } = position.coords;

          // Fetch City
          try {
            const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const geoData = await geoRes.json();
            const city = geoData.city || geoData.locality || "Unknown City";

            // Upsert Session to DB
            await supabase.from("user_sessions").upsert({
              user_id: user.id,
              session_id: sessionId,
              device_name: deviceName,
              city: city,
              country: "Nigeria",
              last_active: new Date().toISOString()
            }, { onConflict: "session_id" });

          } catch (err) {
            console.error("Session sync error:", err);
          }
        },
        (error) => {
          console.error("Location denied:", error);
          setLocationStatus("denied");
          setIsLocationMandatory(true); // Trigger UI block
        }
      );
    };

    trackSession();

    // Heartbeat every 5 minutes
    const interval = setInterval(() => trackSession(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [supabase]);

  return { locationStatus, isLocationMandatory };
}
