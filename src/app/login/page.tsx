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
        <div className="grid grid-cols-2 gap-4 mb-12">
          <button className="flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 transition-colors rounded-2xl py-3.5 text-sm font-medium text-zinc-700">
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
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
            Login
          </button>
          <button className="flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 transition-colors rounded-2xl py-3.5 text-sm font-medium text-zinc-700">
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current" aria-hidden="true">
              <path d="M16.365 9.921c-.021-2.903 2.37-4.305 2.477-4.373-1.349-1.977-3.444-2.247-4.187-2.29-1.782-.18-3.483 1.05-4.39 1.05-.908 0-2.31-1.018-3.805-1.002-1.956.023-3.754 1.137-4.757 2.883-2.031 3.523-.521 8.71 1.455 11.564.965 1.393 2.109 2.956 3.633 2.898 1.488-.06 2.052-.962 3.766-.962 1.7 0 2.243.962 3.791.933 1.58-.027 2.563-1.424 3.513-2.822 1.11-1.621 1.569-3.193 1.593-3.275-.034-.014-3.067-1.176-3.089-4.594zM14.659 4.88c.813-.984 1.36-2.35 1.211-3.71-1.157.046-2.583.769-3.418 1.777-.665.795-1.325 2.195-1.146 3.535 1.29.1 2.54-.666 3.353-1.611l.01-.01v.018z" />
            </svg>
            Login
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
