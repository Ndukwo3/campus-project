"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, EyeOff, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log("Attempting login with email:", email);
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        console.error("Login call returned error:", loginError);
        // Custom message for invalid credentials which often means user not found or wrong password
        if (loginError.message.includes("Invalid login credentials")) {
          setError("Account not found or password incorrect. Don't have an account? Sign up below.");
        } else {
          setError(loginError.message);
        }
        setIsLoading(false);
        return;
      }

      console.log("Login successful, user data:", data);

      if (data.user) {
        router.push("/");
      } else {
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Critical error during login fetch:", err);
      setError("Network error: Failed to connect to Supabase. Please check your internet connection.");
      setIsLoading(false);
    }
  };

  const [nonce, setNonce] = useState<string | null>(null);

  // 🛡️ Initialize Google GSI on Mount for speed and reliability
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    let retryCount = 0;
    const maxRetries = 10;

    const initGoogle = () => {
      const { google } = window as any;
      if (!google) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(initGoogle, 500);
        } else {
          console.error("Google GSI script not found after max retries");
        }
        return;
      }

      console.log("Initializing Google with Client ID:", clientId);

      // Stable nonce for this session
      let rawNonce = sessionStorage.getItem('g_nonce');
      if (!rawNonce) {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        rawNonce = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
        sessionStorage.setItem('g_nonce', rawNonce);
      }
      setNonce(rawNonce);

      try {
        google.accounts.id.initialize({
          client_id: clientId,
          nonce: rawNonce,
          ux_mode: "popup",
          callback: async (response: any) => {
            try {
              setIsLoading(true);
              console.log("Google callback triggered!");
              const { data, error: idTokenError } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: response.credential,
                nonce: rawNonce!,
              });

              if (idTokenError) throw idTokenError;

              if (data.user) {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('id, username, first_name, last_name, university_id')
                  .eq('id', data.user.id)
                  .single();

                if (!profile || !profile.username || !profile.first_name || !profile.last_name || !profile.university_id) {
                  router.push("/onboarding");
                } else {
                  router.push("/");
                }
              }
            } catch (err: any) {
              console.error("Google verify error:", err);
              setError(err.message || "Failed to verify Google account.");
              setIsLoading(false);
            }
          },
        });

        // Use a small delay to ensure the DOM element is ready and has dimensions
        setTimeout(() => {
          const googleButtonDiv = document.getElementById("google-button-div");
          if (googleButtonDiv) {
            console.log("Rendering Google button into div");
            google.accounts.id.renderButton(googleButtonDiv, {
              theme: "outline",
              size: "large",
              width: 320, // Explicit width for consistency
              text: "continue_with",
              shape: "pill",
              logo_alignment: "left"
            });
          }
        }, 100);
      } catch (err) {
        console.error("Error during Google init:", err);
      }
    };

    initGoogle();
  }, [supabase, router]);

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black text-zinc-900 dark:text-white font-sans px-6 py-12 transition-colors">
      {/* App Bar */}
      <div className="flex items-center mb-8">
        <Link
          href="/"
          className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />
        </Link>
      </div>

      <div className="flex-1 flex flex-col w-full max-w-md mx-auto">
        <h1 className="text-3xl font-black text-center mb-2 tracking-tight uppercase">Login</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-center mb-8 font-bold text-[13px] uppercase tracking-widest">Welcome back to <span className="text-zinc-900 dark:text-[#E2FF3D] font-black italic underline decoration-[#E5FF66] decoration-4 underline-offset-4">Univas</span></p>

        <form onSubmit={handleLogin}>
          {/* Form Group - Email */}
          <div className="mb-6">
            <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-600 mb-2 px-1 uppercase tracking-widest">Email</label>
            <div className="relative">
              <input
                type="email"
                placeholder="email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl px-5 py-4 text-[15px] outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-[#E5FF66]/50 transition-all font-bold text-black dark:text-white border border-transparent dark:border-zinc-800"
              />
            </div>
          </div>

          {/* Form Group - Password */}
          <div className="mb-2">
            <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-600 mb-2 px-1 uppercase tracking-widest">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="password@@1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl px-5 py-4 text-[15px] outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-[#E5FF66]/50 transition-all font-bold text-black dark:text-white border border-transparent dark:border-zinc-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
              >
                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end mb-8 px-1">
            <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">
              Forgot Password?
            </Link>
          </div>

          {error && <p className="text-red-500 text-[13px] font-bold mb-4 px-1">{error}</p>}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1A1A24] dark:bg-[#E2FF3D] text-white dark:text-black rounded-2xl py-5 font-black text-[15px] hover:bg-black dark:hover:bg-white transition-all shadow-lg dark:shadow-none flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isLoading ? "Authenticating..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center mt-6 mb-8">
          <div className="absolute inset-0 flex items-center px-4">
            <div className="w-full border-t border-zinc-100 dark:border-zinc-800"></div>
          </div>
          <div className="relative bg-white dark:bg-black px-4 text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
            Or login with
          </div>
        </div>

        {/* Social Buttons */}
        <div className="flex flex-col gap-4 mb-12">
          <div 
            id="google-button-div" 
            className="w-full flex justify-center overflow-hidden" 
            style={{ height: '50px' }}
          >
            {/* Google GSI will render button here */}
          </div>
        </div>

        <div className="mt-auto flex flex-col items-center gap-8">
          {/* Signup switch */}
          <p className="text-[12px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-[0.2em]">
            Don't have an account? <Link href="/signup" className="text-zinc-900 dark:text-white hover:underline decoration-[#E5FF66] decoration-2 underline-offset-4 transition-colors">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
