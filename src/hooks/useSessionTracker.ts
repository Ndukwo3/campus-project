"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";

export function useSessionTracker() {
  const supabase = createClient();
  const [isLocationMandatory, setIsLocationMandatory] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"pending" | "granted" | "denied" | "prompt">("pending");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const requestLocation = useCallback(async () => {
    if (!("geolocation" in navigator)) {
      setLocationStatus("denied");
      setErrorMsg("Geolocation not supported");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Detect Device Info
    const ua = navigator.userAgent;
    const platform = (navigator as any).platform || "";
    let deviceName = "Unknown Device";
    
    if (/iPhone/i.test(ua)) deviceName = "iPhone";
    else if (/Android/i.test(ua)) deviceName = "Android Device";
    else if (/Mac/i.test(platform) || /Macintosh/i.test(ua)) deviceName = "MacBook Pro";
    else if (/Win/i.test(platform) || /Windows/i.test(ua)) deviceName = "Windows PC";

    let sessionId = localStorage.getItem("univas_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("univas_session_id", sessionId);
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocationStatus("granted");
        setErrorMsg(null);
        setIsLocationMandatory(false);
        const { latitude, longitude } = position.coords;

        try {
          const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const geoData = await geoRes.json();
          const city = geoData.city || geoData.locality || "Unknown City";

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
        console.error("Location error:", error);
        setLocationStatus("denied");
        setIsLocationMandatory(true);
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setErrorMsg("Permission denied. Please enable location in your browser/device settings.");
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMsg("Location information is unavailable on this device.");
            break;
          case error.TIMEOUT:
            setErrorMsg("Request timed out. Please try again.");
            break;
          default:
            setErrorMsg("An unknown error occurred while accessing location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [supabase]);

  useEffect(() => {
    const initTracker = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Try to check permission state if supported
      if (typeof navigator !== "undefined" && "permissions" in navigator) {
        try {
          const status = await navigator.permissions.query({ name: "geolocation" as any });
          if (status.state === "granted") {
            requestLocation();
          } else if (status.state === "denied") {
            setLocationStatus("denied");
            setIsLocationMandatory(true);
          } else {
            setLocationStatus("prompt");
            requestLocation(); // Still try once to trigger browser native prompt
          }
          
          status.onchange = () => {
            if (status.state === "granted") requestLocation();
          };
        } catch (e) {
          requestLocation();
        }
      } else {
        requestLocation();
      }
    };

    initTracker();

    const interval = setInterval(() => {
      const checkUserAndRetry = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) requestLocation();
      };
      checkUserAndRetry();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [supabase, requestLocation]);

  return { locationStatus, isLocationMandatory, errorMsg, requestLocation };
}
