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

    const fallbackToIP = async () => {
      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipData = await ipRes.json();
        
        if (ipData.city) {
          setLocationStatus("granted");
          setIsLocationMandatory(false);
          setErrorMsg(null);
          localStorage.setItem("univas_location_verified", "true");

          await supabase.from("user_sessions").upsert({
            user_id: user.id,
            session_id: sessionId,
            device_name: deviceName,
            city: ipData.city || "Unknown City",
            country: ipData.country_name || "Nigeria",
            last_active: new Date().toISOString()
          }, { onConflict: "session_id" });
        } else {
          throw new Error("IP Geolocation failed");
        }
      } catch (err) {
        console.error("IP Fallback failed:", err);
        setLocationStatus("denied");
        
        // ONLY block if they haven't been verified before
        const isPreviouslyVerified = localStorage.getItem("univas_location_verified") === "true";
        if (!isPreviouslyVerified) {
          setIsLocationMandatory(true);
          setErrorMsg("Location could not be determined. Please enable location or check your connection.");
        }
      }
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocationStatus("granted");
        setErrorMsg(null);
        setIsLocationMandatory(false);
        localStorage.setItem("univas_location_verified", "true");
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
          fallbackToIP();
        }
      },
      (error) => {
        console.warn("GPS failed, trying IP fallback...", error);
        fallbackToIP();
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    );
  }, [supabase]);

  useEffect(() => {
    const initTracker = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isVerified = localStorage.getItem("univas_location_verified") === "true";
      
      if (typeof navigator !== "undefined" && "permissions" in navigator) {
        try {
          const status = await navigator.permissions.query({ name: "geolocation" as any });
          
          if (status.state === "granted") {
            requestLocation();
          } else if (status.state === "denied") {
            // If denied but previously verified, just try to update silently
            if (isVerified) {
              requestLocation(); // This will trigger fallbackToIP silently
            } else {
              // Not verified and denied -> Trigger fallback immediately
              requestLocation(); 
            }
          } else {
            // "prompt" state
            setLocationStatus("prompt");
            if (!isVerified) {
              // Still trigger once to show native prompt
              requestLocation();
            }
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
