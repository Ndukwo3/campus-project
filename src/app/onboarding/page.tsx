"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type UniversityType = "Federal" | "State" | "Private";

const UNIVERSITIES: Record<UniversityType, string[]> = {
  Federal: [
    "Abubakar Tafawa Balewa University, Bauchi",
    "Ahmadu Bello University, Zaria",
    "Bayero University, Kano",
    "Federal University of Agriculture, Abeokuta",
    "Federal University of Petroleum Resources, Effurun",
    "Federal University of Technology, Akure",
    "Federal University of Technology, Minna",
    "Federal University of Technology, Owerri",
    "Federal University, Birnin-Kebbi",
    "Federal University, Dutse",
    "Federal University, Dutsin-Ma",
    "Federal University, Gashua",
    "Federal University, Gusau",
    "Federal University, Kashere",
    "Federal University, Lafia",
    "Federal University, Lokoja",
    "Federal University, Otuoke",
    "Federal University, Oye-Ekiti",
    "Federal University, Wukari",
    "Federal University, Ndifu-Alike",
    "Federal University of Health Sciences, Azare",
    "Federal University of Health Sciences, Ila-Orangun",
    "Michael Okpara University of Agriculture, Umudike",
    "Modibbo Adama University, Yola",
    "National Open University of Nigeria",
    "Nigerian Defence Academy, Kaduna",
    "Nnamdi Azikiwe University, Awka",
    "Obafemi Awolowo University, Ile-Ife",
    "University of Abuja",
    "University of Benin",
    "University of Calabar",
    "University of Ibadan",
    "University of Ilorin",
    "University of Jos",
    "University of Lagos",
    "University of Maiduguri",
    "University of Nigeria, Nsukka",
    "University of Port Harcourt",
    "University of Uyo",
    "Usmanu Danfodiyo University, Sokoto"
  ],
  State: [
    "Abia State University, Uturu",
    "Adamawa State University, Mubi",
    "Adekunle Ajasin University, Akungba-Akoko",
    "Akwa Ibom State University",
    "Ambrose Alli University, Ekpoma",
    "Bauchi State University, Gadau",
    "Benue State University, Makurdi",
    "Borno State University",
    "Chukwuemeka Odumegwu Ojukwu University",
    "Cross River University of Technology",
    "Delta State University, Abraka",
    "Ebonyi State University",
    "Edo State University, Uzairue",
    "Ekiti State University",
    "Enugu State University of Science and Technology",
    "Gombe State University",
    "Ibrahim Badamasi Babangida University, Lapai",
    "Ignatius Ajuru University of Education",
    "Imo State University",
    "Kaduna State University",
    "Kano State University of Science and Technology",
    "Kebbi State University of Science and Technology",
    "Kogi State University",
    "Kwara State University",
    "Lagos State University",
    "Nasarawa State University",
    "Niger State University of Education",
    "Olabisi Onabanjo University",
    "Ondo State University of Science and Technology",
    "Osun State University",
    "Plateau State University",
    "Rivers State University",
    "Sokoto State University",
    "Taraba State University",
    "Umaru Musa Yar’adua University",
    "Yobe State University",
    "Zamfara State University"
  ],
  Private: [
    "Achievers University, Owo",
    "Adeleke University, Ede",
    "Afe Babalola University, Ado-Ekiti",
    "African University of Science and Technology, Abuja",
    "Ahman Pategi University",
    "Ajayi Crowther University",
    "Al-Hikmah University",
    "Al-Qalam University",
    "American University of Nigeria",
    "Augustine University",
    "Babcock University",
    "Bells University of Technology",
    "Benson Idahosa University",
    "Bingham University",
    "Bowen University",
    "Caleb University",
    "Caritas University",
    "Chrisland University",
    "Clifford University",
    "Coal City University",
    "Covenant University",
    "Crawford University",
    "Dominican University",
    "Eastern Palm University",
    "Edwin Clark University",
    "Elizade University",
    "Evangel University",
    "Fountain University",
    "Godfrey Okoye University",
    "Gregory University",
    "Hallmark University",
    "Hezekiah University",
    "Igbinedion University",
    "Joseph Ayo Babalola University",
    "Kings University",
    "Kola Daisi University",
    "Landmark University",
    "Lead City University",
    "Madonna University",
    "McPherson University",
    "Mountain Top University",
    "Nile University of Nigeria",
    "Novena University",
    "Obong University",
    "Oduduwa University",
    "Pan-Atlantic University",
    "Paul University",
    "Redeemer’s University",
    "Renaissance University",
    "Rhema University",
    "Salem University",
    "Skyline University",
    "Summit University",
    "Tansian University",
    "Trinity University",
    "University of Mkar",
    "Veritas University",
    "Wellspring University"
  ],
};

const LEVELS = ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "600 Level", "Postgraduate", "Graduate"];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [uniType, setUniType] = useState<UniversityType>("Federal");
  const [selectedUni, setSelectedUni] = useState("");
  const [uniSearch, setUniSearch] = useState("");
  const [isUniDropdownOpen, setIsUniDropdownOpen] = useState(false);
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

      // Finish animation and redirect
      setTimeout(() => {
        router.push("/");
      }, 2000);

    } catch (err: any) {
      setError(err.message || "An error occurred during onboarding.");
      setIsCompleting(false);
    }
  };

  const filteredUniversities = UNIVERSITIES[uniType].filter((uni) =>
    uni.toLowerCase().includes(uniSearch.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900 font-sans relative overflow-hidden">
      <div className={`flex flex-col min-h-screen px-6 py-12 transition-all duration-700 ${isCompleting ? "blur-md scale-[0.98] pointer-events-none" : ""}`}>
        {/* App Bar */}
        <div className="flex items-center mb-8">
          {step === 1 ? (
            <Link
              href="/signup"
              className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-800" />
            </Link>
          ) : (
            <button
              onClick={() => setStep(1)}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
              aria-label="Go back to step 1"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-800" />
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col w-full max-w-md mx-auto">
          {step === 1 ? (
            <>
              <h1 className="text-3xl font-semibold text-center mb-2 tracking-tight">Complete Your Profile</h1>
              <p className="text-zinc-500 text-center mb-10 text-sm">Let's set up your academic details</p>

              {/* University Type Selector */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-zinc-500 mb-4 px-1 text-center">Select University Type</label>
                <div className="flex p-1 bg-zinc-100 rounded-full relative">
                  {(["Federal", "State", "Private"] as UniversityType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setUniType(type);
                        setSelectedUni(""); // Reset uni when type changes
                        setUniSearch("");
                      }}
                      className={`flex-1 py-3 text-sm font-medium rounded-full z-10 transition-all duration-300 ${uniType === type ? "bg-[#E2FF3D] text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Searchable University Dropdown */}
              <div className="mb-6 relative">
                <label className="block text-sm text-zinc-500 mb-2 px-1">University</label>
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
                    className="w-full bg-zinc-100 rounded-2xl px-5 py-4 text-[15px] outline-none focus:ring-2 focus:ring-[#E2FF3D]/50 transition-all font-medium pr-12"
                  />
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none group-hover:text-zinc-600 transition-colors" />
                </div>

                {isUniDropdownOpen && (
                  <ul className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-zinc-100 max-h-60 overflow-y-auto">
                    {filteredUniversities.length > 0 ? (
                      filteredUniversities.map((uni) => (
                        <li
                          key={uni}
                          onMouseDown={() => {
                            setSelectedUni(uni);
                            setUniSearch(uni);
                          }}
                          className="px-5 py-3 text-[15px] hover:bg-zinc-50 cursor-pointer transition-colors"
                        >
                          {uni}
                        </li>
                      ))
                    ) : (
                      <li className="px-5 py-3 text-[15px] text-zinc-500 text-center">No universities found</li>
                    )}
                  </ul>
                )}
              </div>

              {/* Department Selection */}
              <div className="mb-6">
                <label className="block text-sm text-zinc-500 mb-2 px-1">Department</label>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Enter your department"
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full bg-zinc-100 rounded-2xl px-5 py-4 text-[15px] outline-none focus:ring-2 focus:ring-[#E2FF3D]/50 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Level Selection */}
              <div className="mb-10">
                <label className="block text-sm text-zinc-500 mb-2 px-1">Level</label>
                <div className="relative group">
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full bg-zinc-100 rounded-2xl px-5 py-4 text-[15px] outline-none appearance-none focus:ring-2 focus:ring-[#E2FF3D]/50 transition-all font-medium pr-12 cursor-pointer"
                  >
                    <option value="" disabled>Select your current level</option>
                    {LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none group-hover:text-zinc-600 transition-colors" />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mb-4 px-1">{error}</p>}

              {/* Primary Action Button */}
              <button
                onClick={() => setStep(2)}
                disabled={!selectedUni || !selectedDept || !selectedLevel}
                className="w-full bg-[#1A1A24] text-white rounded-2xl py-4.5 font-medium text-[15px] hover:bg-black transition-all mb-10 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                Next
              </button>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-semibold text-center mb-2 tracking-tight">Choose your username</h1>
              <p className="text-zinc-500 text-center mb-10 text-sm">You can always change this later</p>

              <div className="mb-10">
                <label className="block text-sm text-zinc-500 mb-2 px-1">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="@johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-100 rounded-2xl px-5 py-4 text-[15px] outline-none placeholder:text-zinc-900/50 focus:ring-2 focus:ring-[#E2FF3D]/50 transition-all font-medium"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mb-4 px-1">{error}</p>}

              <button
                onClick={handleComplete}
                disabled={!username || isCompleting}
                className="w-full bg-[#1A1A24] text-white rounded-2xl py-4.5 font-medium text-[15px] hover:bg-black transition-all mb-10 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isCompleting && <Loader2 className="w-4 h-4 animate-spin text-[#E2FF3D]" />}
                {isCompleting ? "Saving Details..." : "Complete Profile"}
              </button>
            </>
          )}


          <p className="text-center text-[13px] text-zinc-400 mt-auto">
            Need help? <a href="#" className="underline hover:text-zinc-600 transition-colors">Contact Support</a>
          </p>
        </div>
      </div>

      {/* Success Animation Overlay */}
      {isCompleting && !error && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/10 backdrop-blur-sm animate-scale-in">
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
            <p className="text-2xl font-semibold tracking-tight text-zinc-900">Account Created!</p>
          </div>
        </div>
      )}
    </div>
  );
}
