"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type UniversityType = "Federal" | "State" | "Private";

const LEVELS = ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "600 Level", "Postgraduate", "Graduate"];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [uniType, setUniType] = useState<UniversityType>("Federal");
  const [universities, setUniversities] = useState<any[]>([]);
  const [selectedUni, setSelectedUni] = useState("");
  const [uniSearch, setUniSearch] = useState("");
  const [isUniDropdownOpen, setIsUniDropdownOpen] = useState(false);
  const [isLoadingUnis, setIsLoadingUnis] = useState(false);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [username, setUsername] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Your session has expired. Please log in again to continue.");
      }
    };
    checkUser();
  }, [supabase.auth]);

  useEffect(() => {
    const fetchUnis = async () => {
      setIsLoadingUnis(true);
      let query = supabase
        .from('universities')
        .select('name')
        .eq('type', uniType)
        .order('name');
      
      if (uniSearch) {
        query = query.ilike('name', `%${uniSearch}%`);
      }

      const { data, error } = await query.limit(10);
      
      if (!error && data) {
        setUniversities(data.map((u: any) => u.name));
      }
      setIsLoadingUnis(false);
    };

    const timer = setTimeout(fetchUnis, 300);
    return () => clearTimeout(timer);
  }, [uniType, uniSearch, supabase]);

  const handleComplete = async () => {
    setIsCompleting(true);
    setError(null);

    // Use getSession to ensure we have the latest session state
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      setError("Session not found. Please log in and try again.");
      setIsCompleting(false);
      return;
    }

    try {
      // 1. Ensure University exists
      let { data: university, error: uniError } = await supabase
        .from('universities')
        .select('id')
        .eq('name', selectedUni)
        .single();

      if (uniError && uniError.code !== 'PGRST116') throw uniError;

      if (!university) {
        const { data: newUni, error: createUniError } = await supabase
          .from('universities')
          .insert({ name: selectedUni })
          .select('id')
          .single();
        if (createUniError) throw createUniError;
        university = newUni;
      }

      // 2. Ensure Department exists
      let { data: department, error: deptError } = await supabase
        .from('departments')
        .select('id')
        .eq('name', selectedDept)
        .eq('university_id', university.id)
        .single();

      if (deptError && deptError.code !== 'PGRST116') throw deptError;

      if (!department) {
        const { data: newDept, error: createDeptError } = await supabase
          .from('departments')
          .insert({ name: selectedDept, university_id: university.id })
          .select('id')
          .single();
        if (createDeptError) throw createDeptError;
        department = newDept;
      }

      // 3. Update User Profile
      const metadata = user.user_metadata || {};
      
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username.startsWith('@') ? username : `@${username}`,
          first_name: metadata.first_name || null,
          last_name: metadata.last_name || null,
          full_name: metadata.full_name || "New Student",
          university_id: university.id,
          department_id: department.id,
          level: selectedLevel,
        });

      if (profileUpdateError) throw profileUpdateError;

      // 4. Send Welcome Notification
      const { error: notificationError } = await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'welcome',
        content: "Welcome to Univas! Explore the feed, connect with students in your university, and share your first story! 🎉",
        is_read: false
      });
      if (notificationError) console.error("Could not send welcome notification (table might not exist yet):", notificationError);

      // Finish animation and redirect
      setTimeout(() => {
        router.push("/");
      }, 2000);

    } catch (err: any) {
      setError(err.message || "An error occurred during onboarding.");
      setIsCompleting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black text-zinc-900 dark:text-white font-sans relative overflow-hidden transition-colors">
      <div className={`flex flex-col min-h-screen px-6 py-12 transition-all duration-700 ${isCompleting ? "blur-md scale-[0.98] pointer-events-none" : ""}`}>
        {/* App Bar */}
        <div className="flex items-center mb-8">
          {step === 1 ? (
            <Link
              href="/signup"
              className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />
            </Link>
          ) : (
            <button
               onClick={() => setStep(1)}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Go back to step 1"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col w-full max-w-md mx-auto">
          {step === 1 ? (
            <>
              <h1 className="text-3xl font-black text-center mb-2 tracking-tight text-zinc-900 dark:text-white">Complete Your Profile</h1>
              <p className="text-zinc-400 dark:text-zinc-500 text-center mb-10 text-sm font-medium">Let's set up your academic details</p>

              {/* University Type Selector */}
              <div className="mb-8">
                <label className="block text-sm font-black text-zinc-400 dark:text-zinc-600 mb-4 px-1 text-center uppercase tracking-widest">Select University Type</label>
                <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-full relative">
                  {(["Federal", "State", "Private"] as UniversityType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setUniType(type);
                        setSelectedUni(""); // Reset uni when type changes
                        setUniSearch("");
                      }}
                      className={`flex-1 py-3 text-sm font-black rounded-full z-10 transition-all duration-300 ${uniType === type ? "bg-[#E2FF3D] text-zinc-900 shadow-sm" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Searchable University Dropdown */}
              <div className="mb-6 relative">
                <label className="block text-sm font-black text-zinc-400 dark:text-zinc-600 mb-2 px-1 uppercase tracking-widest">University</label>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Select your school"
                    value={isUniDropdownOpen ? uniSearch : selectedUni}
                    onChange={(e) => {
                      setUniSearch(e.target.value);
                      if (!isUniDropdownOpen) setIsUniDropdownOpen(true);
                    }}
                    onFocus={() => {
                      setIsUniDropdownOpen(true);
                      setUniSearch("");
                    }}
                    onBlur={() => {
                      // Delay closing dropdown so click on option can register
                      setTimeout(() => setIsUniDropdownOpen(false), 200);
                    }}
                    className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl px-5 py-4 text-[15px] outline-none focus:ring-2 focus:ring-[#E2FF3D]/50 transition-all font-bold pr-12 text-black dark:text-white border border-transparent dark:border-zinc-800"
                  />
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-600 pointer-events-none group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors" />
                </div>

                  {isUniDropdownOpen && (
                  <ul className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 max-h-60 overflow-y-auto overflow-x-hidden">
                    {isLoadingUnis ? (
                      <li className="px-5 py-4 text-[15px] text-zinc-400 dark:text-zinc-500 text-center flex items-center justify-center gap-2">
                         <Loader2 className="w-4 h-4 animate-spin" />
                         Searching...
                      </li>
                    ) : universities.length > 0 ? (
                      universities.map((uni) => (
                        <li
                          key={uni}
                          onMouseDown={() => {
                            setSelectedUni(uni);
                            setUniSearch(uni);
                          }}
                          className="px-5 py-4 text-[15px] font-bold text-zinc-800 dark:text-zinc-200 hover:bg-[#E2FF3D] hover:text-black dark:hover:bg-[#E2FF3D] dark:hover:text-black cursor-pointer transition-colors"
                        >
                          {uni}
                        </li>
                      ))
                    ) : (
                      <li className="px-5 py-4 text-[15px] text-zinc-400 dark:text-zinc-500 text-center font-bold">No universities found</li>
                    )}
                  </ul>
                )}
              </div>

              {/* Department Selection */}
              <div className="mb-6">
                <label className="block text-sm font-black text-zinc-400 dark:text-zinc-600 mb-2 px-1 uppercase tracking-widest">Department</label>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Enter your department"
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl px-5 py-4 text-[15px] outline-none focus:ring-2 focus:ring-[#E2FF3D]/50 transition-all font-bold text-black dark:text-white border border-transparent dark:border-zinc-800"
                  />
                </div>
              </div>

              {/* Level Selection */}
              <div className="mb-10">
                <label className="block text-sm font-black text-zinc-400 dark:text-zinc-600 mb-2 px-1 uppercase tracking-widest">Level</label>
                <div className="relative group">
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl px-5 py-4 text-[15px] outline-none appearance-none focus:ring-2 focus:ring-[#E2FF3D]/50 transition-all font-bold pr-12 cursor-pointer text-black dark:text-white border border-transparent dark:border-zinc-800"
                  >
                    <option value="" disabled className="dark:bg-zinc-900">Select your current level</option>
                    {LEVELS.map((level) => (
                      <option key={level} value={level} className="dark:bg-zinc-900">
                        {level}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-600 pointer-events-none group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors" />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mb-4 px-1">{error}</p>}

              {/* Primary Action Button */}
              <button
                onClick={() => setStep(2)}
                disabled={!selectedUni || !selectedDept || !selectedLevel}
                className="w-full bg-[#1A1A24] dark:bg-zinc-800 text-white rounded-2xl py-5 font-black text-[15px] uppercase tracking-widest hover:bg-black dark:hover:bg-zinc-700 transition-all mb-10 shadow-lg dark:shadow-none disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                Continue
              </button>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-black text-center mb-2 tracking-tight text-zinc-900 dark:text-white">Choose your username</h1>
              <p className="text-zinc-400 dark:text-zinc-500 text-center mb-10 text-sm font-medium">You can always change this later</p>

              <div className="mb-10">
                <label className="block text-sm font-black text-zinc-400 dark:text-zinc-600 mb-2 px-1 uppercase tracking-widest">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="@johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl px-5 py-4 text-[15px] outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-[#E2FF3D]/50 transition-all font-bold text-black dark:text-white border border-transparent dark:border-zinc-800"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mb-4 px-1">{error}</p>}

              <button
                onClick={handleComplete}
                disabled={!username || isCompleting}
                className="w-full bg-[#1A1A24] dark:bg-[#E2FF3D] text-white dark:text-black rounded-2xl py-5 font-black text-[15px] uppercase tracking-widest hover:bg-black dark:hover:bg-white transition-all mb-10 shadow-lg dark:shadow-none disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isCompleting && <Loader2 className="w-5 h-5 animate-spin text-[#E2FF3D] dark:text-zinc-900" />}
                {isCompleting ? "Saving Details..." : "Complete Profile"}
              </button>
            </>
          )}


          <p className="text-center text-[13px] text-zinc-400 dark:text-zinc-600 mt-auto font-bold uppercase tracking-widest">
            Need help? <a href="#" className="underline hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">Contact Support</a>
          </p>
        </div>
      </div>

      {/* Success Animation Overlay */}
      {isCompleting && !error && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/10 dark:bg-black/10 backdrop-blur-md animate-scale-in">
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-40 h-40">
              {/* Background Circle */}
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="45"
                  fill="none"
                  stroke="#E2FF3D"
                  strokeWidth="8"
                  className="opacity-20"
                />
                {/* Animated Drawing Circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="45"
                  fill="none"
                  stroke="#E2FF3D"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="animate-draw-circle"
                />
              </svg>
              {/* Animated Checkmark */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-20 h-20 text-[#E2FF3D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" className="animate-draw-check" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">Account Created!</p>
          </div>
        </div>
      )}
    </div>
  );
}
