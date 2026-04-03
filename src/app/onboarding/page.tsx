"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { ArrowLeft, Check, Loader2, User, UserPlus, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type UniversityType = "Federal" | "State" | "Private";

const LEVELS = ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "600 Level", "Postgraduate", "Graduate"];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
  
  // Suggested Connections States (Moved here for Step 4)
  const [connectingIds, setConnectingIds] = useState<Set<string>>(new Set());
  const universityId = selectedUni; // Just to keep the query clean
  
  const { data: suggestions = [], isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ['suggested-connections', selectedUni],
    queryFn: async () => {
      if (!selectedUni || step !== 4) return [];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: friendsData } = await supabase
        .from('friends')
        .select('user_id1, user_id2')
        .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`);

      const friendIds = new Set(friendsData?.flatMap((f: any) => [f.user_id1, f.user_id2]) || []);
      friendIds.add(user.id);

      const { data: admins } = await supabase.from('profiles').select('*').eq('role', 'admin').limit(3);
      const { data: students } = await supabase.from('profiles')
        .select('*')
        .eq('university_id', selectedUni)
        .neq('role', 'super_admin')
        .neq('role', 'admin')
        .limit(20);

      let studentList = students || [];
      if (studentList.length < 5) {
        const { data: globalUsers } = await supabase.from('profiles')
           .select('*')
           .neq('role', 'super_admin')
           .neq('role', 'admin')
           .neq('university_id', selectedUni)
           .limit(10);
        studentList = [...studentList, ...(globalUsers || [])];
      }

      const filteredStudents = studentList.filter((u: any) => !friendIds.has(u.id));
      const filteredAdmins = (admins || []).filter((u: any) => !friendIds.has(u.id));
      
      const seen = new Set();
      const uniqueStudents = filteredStudents.filter((u: any) => {
         if (seen.has(u.id)) return false;
         seen.add(u.id);
         return true;
      });

      return [...filteredAdmins, ...uniqueStudents.sort(() => 0.5 - Math.random()).slice(0, 6)];
    },
    enabled: step === 4 && !!selectedUni,
  });

  const handleConnect = async (targetId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setConnectingIds(prev => new Set(prev).add(targetId));
    try {
      await supabase.from('friends').insert({ user_id1: user.id, user_id2: targetId });
      queryClient.setQueryData(['suggested-connections', selectedUni], (old: any) => old?.filter((u: any) => u.id !== targetId));

    } catch (err) {
      console.error("Connection failed:", err);
    } finally {
      setConnectingIds(prev => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
    }
  };


  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Your session has expired. Please log in again to continue.");
      } else {
        // Pre-fill from metadata if available (for Google users)
        const metadata = session.user.user_metadata || {};
        if (metadata.first_name) setFirstName(metadata.first_name);
        else if (metadata.given_name) setFirstName(metadata.given_name);
        
        if (metadata.last_name) setLastName(metadata.last_name);
        else if (metadata.family_name) setLastName(metadata.family_name);
        
        if (metadata.full_name && (!metadata.first_name && !metadata.given_name)) {
             setFirstName(metadata.full_name.split(' ')[0] || "");
             setLastName(metadata.full_name.split(' ').slice(1).join(' ') || "");
        }
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
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
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

      // 2. Automatically connect with Super Admin
      const { data: superAdmin } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'super_admin')
        .single();

      if (superAdmin && superAdmin.id !== user.id) {
        // Create the official friendship - ensuring user_id1 < user_id2 for the constraint
        const [id1, id2] = [user.id, superAdmin.id].sort();
        await supabase
          .from('friends')
          .insert({
            user_id1: id1,
            user_id2: id2
          });


        
        // Send a notification to Super Admin that looks like a request
        await supabase
          .from('notifications')
          .insert({
            user_id: superAdmin.id,
            sender_id: user.id,
            type: 'connect_request',
            content: 'wants to connect with you!',
            is_read: false
          });
      }

      // 3. Move to suggestions step
      setIsCompleting(false);
      setStep(4);
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
              href="/"
              className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />
            </Link>
          ) : (
            <button
               onClick={() => setStep(step - 1)}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              aria-label={`Go back to step ${step - 1}`}
            >
              <ArrowLeft className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col w-full max-w-md mx-auto">
          {step === 1 ? (
            <>
              <h1 className="text-3xl font-black text-center mb-2 tracking-tight text-zinc-900 dark:text-white">What's your name?</h1>
              <p className="text-zinc-400 dark:text-zinc-500 text-center mb-10 text-sm font-medium">To keep things professional and clear</p>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-600 mb-2 px-1 uppercase tracking-widest">First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl px-5 py-4 text-[15px] outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-[#E2FF3D]/50 transition-all font-bold text-black dark:text-white border border-transparent dark:border-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-600 mb-2 px-1 uppercase tracking-widest">Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl px-5 py-4 text-[15px] outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-[#E2FF3D]/50 transition-all font-bold text-black dark:text-white border border-transparent dark:border-zinc-800"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mb-4 px-1">{error}</p>}

              <button
                onClick={() => setStep(2)}
                disabled={!firstName || !lastName}
                className={`w-full rounded-2xl py-5 font-black text-[15px] uppercase tracking-widest transition-all shadow-lg dark:shadow-none disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] ${
                  (!firstName || !lastName) 
                  ? "bg-[#1A1A24] dark:bg-zinc-800 text-white" 
                  : "bg-[#E2FF3D] text-black shadow-[#E2FF3D]/20 shadow-xl"
                }`}
              >
                Next Step
              </button>
            </>
          ) : step === 2 ? (
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
                onClick={() => setStep(3)}
                disabled={!selectedUni || !selectedDept || !selectedLevel}
                className={`w-full rounded-2xl py-5 font-black text-[15px] uppercase tracking-widest transition-all mb-10 shadow-lg dark:shadow-none disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] ${
                  (!selectedUni || !selectedDept || !selectedLevel) 
                  ? "bg-[#1A1A24] dark:bg-zinc-800 text-white" 
                  : "bg-[#E2FF3D] text-black shadow-[#E2FF3D]/20 shadow-xl"
                }`}
              >
                Continue
              </button>
            </>
          ) : step === 4 ? (
             <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
               <h1 className="text-3xl font-black text-center mb-2 tracking-tight text-zinc-900 dark:text-white leading-tight">Build Your Loop</h1>
               <p className="text-zinc-500 dark:text-zinc-500 text-center mb-8 text-sm font-medium">Connect with some students from your school</p>
               
               <div className="flex-1 overflow-y-auto pr-1 mb-8 max-h-[45vh] scrollbar-hide">
                 {/* Re-using the logic from SuggestedConnections component but expanded for onboarding */}
                 <div className="flex flex-col gap-4">
                   {isLoadingSuggestions ? (
                      [1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl animate-pulse">
                          <div className="w-14 h-14 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                          <div className="flex-1">
                            <div className="w-24 h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-2" />
                            <div className="w-16 h-3 bg-zinc-100 dark:bg-zinc-900 rounded-full" />
                          </div>
                        </div>
                      ))
                   ) : suggestions.map((user: any) => (
                      <div key={user.id} className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-[32px] border border-transparent hover:border-[#E2FF3D]/20 transition-all group">
                         <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 relative flex items-center justify-center shrink-0">
                           {user.avatar_url ? (
                              <Image src={user.avatar_url} alt="" fill className="object-cover" />
                           ) : (
                              <User className="text-zinc-400 dark:text-zinc-600 w-7 h-7" strokeWidth={2.5} />
                           )}
                         </div>
                         <div className="flex-1 min-w-0">
                           <h4 className="text-[15px] font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight truncate">{user.full_name}</h4>
                           <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest truncate">@{user.username}</p>
                         </div>
                         <button
                           onClick={() => handleConnect(user.id)}
                           disabled={connectingIds.has(user.id)}
                           className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-[0.95] flex items-center gap-2 ${
                             connectingIds.has(user.id)
                             ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                             : "bg-[#E2FF3D] text-black shadow-lg shadow-[#E2FF3D]/10 hover:shadow-[#E2FF3D]/20"
                           }`}
                         >
                           {connectingIds.has(user.id) ? (
                             <Loader2 size={14} className="animate-spin" />
                           ) : (
                             <UserPlus size={14} />
                           )}
                           {connectingIds.has(user.id) ? "Linking..." : "Connect"}
                         </button>
                      </div>
                   ))}
                 </div>
               </div>

               <p className="text-center text-[10px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.2em] mb-8">
                 Ready to explore?
               </p>

               <button
                 onClick={() => router.push("/")}
                 className="w-full bg-[#1A1A24] dark:bg-[#E2FF3D] text-white dark:text-black rounded-3xl py-5 font-black text-[15px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#E2FF3D]/10"
               >
                 Take me to the Feed
               </button>
             </div>
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
                 className={`w-full rounded-2xl py-5 font-black text-[15px] uppercase tracking-widest transition-all mb-10 shadow-lg dark:shadow-none disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2 ${
                  (!username || isCompleting) 
                  ? "bg-[#1A1A24] dark:bg-zinc-800 text-white" 
                  : "bg-[#E2FF3D] text-black shadow-[#E2FF3D]/20 shadow-xl"
                }`}
              >
                {isCompleting && <Loader2 className="w-5 h-5 animate-spin text-zinc-900" />}
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
