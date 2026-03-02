import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Users, MessageSquare, BookOpen, Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-200">
              C
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Campus</span>
          </div>
          <div className="hidden gap-8 md:flex">
            <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">About</Link>
            <Link href="/features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</Link>
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Login</Link>
          </div>
          <Link 
            href="/signup" 
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-black hover:shadow-xl active:scale-95"
          >
            Join the Network
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 pt-32 pb-20 lg:px-8 lg:pt-48 lg:pb-32">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
          <div className="absolute top-1/4 -right-20 -z-10 h-72 w-72 rounded-full bg-indigo-400/20 blur-[100px]" />
          <div className="absolute top-1/2 -left-20 -z-10 h-72 w-72 rounded-full bg-sky-400/20 blur-[100px]" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 transition-transform hover:scale-105">
              <Sparkles className="h-4 w-4" />
              <span>Built exclusively for Nigerian Students</span>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl leading-[1.1]">
              Connect, Collaborate, <br /> 
              <span className="bg-gradient-to-r from-indigo-600 to-sky-600 bg-clip-text text-transparent">Conquer Academics.</span>
            </h1>
            <p className="mt-8 text-lg leading-8 text-slate-600 max-w-2xl mx-auto">
              The first social and academic ecosystem designed for Nigerian university students. One profile, thousands of universities, infinite opportunities.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/signup"
                className="group flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-indigo-200 transition-all hover:bg-indigo-700 hover:scale-[1.02] active:scale-95"
              >
                Get Started
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/login" className="text-lg font-semibold leading-6 text-slate-900 hover:text-indigo-600 transition-colors">
                Log in <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Social Proof/Stats */}
          <div className="mx-auto mt-20 max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="flex flex-col items-center p-6 rounded-3xl bg-white shadow-sm border border-slate-100 transition-all hover:shadow-md hover:-translate-y-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <dt className="text-base font-semibold leading-7 text-slate-900">Multi-University</dt>
                <dd className="mt-2 text-center text-sm leading-6 text-slate-500">
                  One platform to connect across every institution in Nigeria.
                </dd>
              </div>
              <div className="flex flex-col items-center p-6 rounded-3xl bg-white shadow-sm border border-slate-100 transition-all hover:shadow-md hover:-translate-y-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                  <Users className="h-6 w-6" />
                </div>
                <dt className="text-base font-semibold leading-7 text-slate-900">Study Groups</dt>
                <dd className="mt-2 text-center text-sm leading-6 text-slate-500">
                  Collaborate in real-time with peers from your department.
                </dd>
              </div>
              <div className="flex flex-col items-center p-6 rounded-3xl bg-white shadow-sm border border-slate-100 transition-all hover:shadow-md hover:-translate-y-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                   <Sparkles className="h-6 w-6" />
                </div>
                <dt className="text-base font-semibold leading-7 text-slate-900">AI Assistant</dt>
                <dd className="mt-2 text-center text-sm leading-6 text-slate-500">
                  Get instant academic help, summaries and study guides.
                </dd>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 font-bold text-white text-xs">C</div>
              <span className="text-lg font-bold tracking-tight text-slate-900">Campus</span>
            </div>
            <p className="text-sm text-slate-500">© 2026 Campus. Designed for the Nigerian Student ecosystem.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
