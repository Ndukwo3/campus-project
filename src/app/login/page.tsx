"use client";

import { useState } from "react";
import { ArrowLeft, EyeOff, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900 font-sans px-6 py-12">
      {/* App Bar */}
      <div className="flex items-center mb-8">
        <button
          className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-800" />
        </button>
      </div>

      <div className="flex-1 flex flex-col w-full max-w-md mx-auto">
        <h1 className="text-3xl font-semibold text-center mb-10 tracking-tight">Login</h1>

        {/* Form Group - Email */}
        <div className="mb-6">
          <label className="block text-sm text-zinc-500 mb-2 px-1">Email</label>
          <div className="relative">
            <input
              type="email"
              placeholder="email@gmail.com"
              className="w-full bg-zinc-100 rounded-2xl px-5 py-4 text-[15px] outline-none placeholder:text-zinc-900/50 focus:ring-2 focus:ring-[#E2FF3D]/50 transition-all font-medium"
            />
          </div>
        </div>

        {/* Form Group - Password */}
        <div className="mb-2">
          <label className="block text-sm text-zinc-500 mb-2 px-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="password@@1"
              className="w-full bg-zinc-100 rounded-2xl px-5 py-4 text-[15px] outline-none placeholder:text-zinc-900/50 focus:ring-2 focus:ring-[#E2FF3D]/50 transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-end mb-8 px-1">
          <Link href="#" className="text-[13px] font-medium text-zinc-500 hover:text-zinc-800 transition-colors">
            Forgot Password?
          </Link>
        </div>

        {/* Primary Action Button */}
        <button className="w-full bg-[#1A1A24] text-white rounded-2xl py-4.5 font-medium text-[15px] hover:bg-black transition-colors mb-10 shadow-sm">
          Login
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute inset-0 flex items-center px-4">
            <div className="w-full border-t border-zinc-100"></div>
          </div>
          <div className="relative bg-white px-4 text-sm text-zinc-400">
            Or login with
          </div>
        </div>

        {/* Social Buttons */}
        <div className="flex flex-col gap-4 mb-12">
          <button className="flex items-center justify-center gap-3 bg-zinc-100 hover:bg-zinc-200 transition-colors rounded-2xl py-4 text-sm font-medium text-zinc-700 w-full">
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
          {/* Signup switch */}
          <p className="text-[13px] text-zinc-500">
            Don't have an account? <Link href="/signup" className="font-semibold text-zinc-800 hover:text-black transition-colors">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
