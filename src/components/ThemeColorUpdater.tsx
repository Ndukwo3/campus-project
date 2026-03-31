"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

/**
 * Dynamically updates the theme-color meta tag based on the current theme.
 * This ensures the Android status bar follows the web app's theme selection.
 */
export default function ThemeColorUpdater() {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    // Determine the active theme (handles 'system' as well)
    const activeTheme = resolvedTheme || theme;
    
    // Select the appropriate color for the status bar
    // Black (#000000) for dark mode, White (#FFFFFF) for light mode
    const color = activeTheme === "dark" ? "#000000" : "#FFFFFF";
    
    // Find or create the theme-color meta tag
    let meta = document.querySelector('meta[name="theme-color"]');
    
    if (meta) {
      meta.setAttribute('content', color);
    } else {
      // Fallback: create it if it somehow missing
      const newMeta = document.createElement('meta');
      newMeta.name = "theme-color";
      newMeta.content = color;
      document.head.appendChild(newMeta);
    }
    
    // Also update Apple specific status bar style if needed
    const appleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (appleMeta) {
      appleMeta.setAttribute('content', activeTheme === "dark" ? "black-translucent" : "default");
    }

  }, [theme, resolvedTheme]);

  return null;
}
