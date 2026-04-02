"use client";

import { useState } from "react";
import { ArrowLeft, EyeOff, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
          },
        },
      });

      if (signupError) {
        if (signupError.message.includes("User already registered")) {
          setError("This email is already in use. Try logging in instead.");
        } else {
          setError(signupError.message);
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        if (data.session) {
          // Automatic login successful
          router.push("/onboarding");
        } else {
          // Email confirmation is likely enabled
          setError("Account created! Please check your email to confirm your account before logging in.");
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError("Network error. Please try again or check your internet.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black text-zinc-900 dark:text-white font-sans px-6 py-12 transition-colors">
      {/* App Bar */}
      <div className="flex items-center mb-8">
        <Link
          href="/login"
          className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />
        </Link>
      </div>

      <div className="flex-1 flex flex-col w-full max-w-md mx-auto">
        <h1 className="text-3xl font-black text-center mb-2 tracking-tight uppercase">Create Account</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-center mb-8 font-bold text-[13px] uppercase tracking-widest">Join <span className="text-zinc-900 dark:text-[#E2FF3D] font-black italic underline decoration-[#E5FF66] decoration-4 underline-offset-4">Univas</span></p>



        <form onSubmit={handleSignup}>
          {/* Form Group - Name */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-600 mb-2 px-1 uppercase tracking-widest">First Name</label>
              <input
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl px-5 py-4 text-[15px] outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-[#E5FF66]/50 transition-all font-bold text-black dark:text-white border border-transparent dark:border-zinc-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-600 mb-2 px-1 uppercase tracking-widest">Last Name</label>
              <input
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl px-5 py-4 text-[15px] outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-[#E5FF66]/50 transition-all font-bold text-black dark:text-white border border-transparent dark:border-zinc-800"
              />
            </div>
          </div>

          {/* Form Group - Email */}
          <div className="mb-6">
            <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-600 mb-2 px-1 uppercase tracking-widest">Email</label>
            <div className="relative">
              <input
                type="email"
                placeholder="johndoe@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl px-5 py-4 text-[15px] outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-[#E5FF66]/50 transition-all font-bold text-black dark:text-white border border-transparent dark:border-zinc-800"
              />
            </div>
          </div>

          {/* Form Group - Password */}
          <div className="mb-8">
            <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-600 mb-2 px-1 uppercase tracking-widest">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="password@@1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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

          {error && <p className="text-red-500 text-sm mb-4 px-1">{error}</p>}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1A1A24] dark:bg-[#E2FF3D] text-white dark:text-black rounded-2xl py-5 font-black text-[15px] hover:bg-black dark:hover:bg-white transition-all shadow-lg dark:shadow-none flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center mt-6 mb-8">
          <div className="absolute inset-0 flex items-center px-4">
            <div className="w-full border-t border-zinc-100 dark:border-zinc-800"></div>
          </div>
          <div className="relative bg-white dark:bg-black px-4 text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
            Or register with
          </div>
        </div>

        {/* Social Buttons */}
        <div className="flex flex-col gap-4 mb-12">
          <button className="flex items-center justify-center gap-3 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors rounded-2xl py-4.5 text-[14px] font-black text-zinc-700 dark:text-zinc-300 w-full uppercase tracking-widest border border-transparent dark:border-zinc-800">
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path
                d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.54998L20.0303 3.125C17.9503 1.19 15.2353 0 12.0003 0C7.31028 0 3.25528 2.69 1.28027 6.60998L5.27028 9.70498C6.21528 6.86 8.87028 4.75 12.0003 4.75Z"
                fill="#EA4335"
              />
              <path
                d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                fill="#4285F4"
              />
              <path
                d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                fill="#FBBC05"
              />
              <path
                d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21538 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                fill="#34A853"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="mt-auto flex flex-col items-center gap-8">
          {/* Terms text */}
          <p className="text-center text-[12px] text-zinc-400 dark:text-zinc-600 max-w-xs leading-relaxed font-bold uppercase tracking-widest">
            By continuing you agree to Univas's <a href="#" className="underline hover:text-zinc-600 dark:hover:text-zinc-400">Terms of Service</a> and <a href="#" className="underline hover:text-zinc-600 dark:hover:text-zinc-400">Privacy Policy</a>
          </p>

          {/* Login switch */}
          <p className="text-[12px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-[0.2em]">
            Already have an account? <Link href="/login" className="text-zinc-900 dark:text-white hover:underline decoration-[#E5FF66] decoration-2 underline-offset-4 transition-colors">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
