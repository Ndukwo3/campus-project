"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Search, Check, ChevronRight, BookOpen, 
  GraduationCap, School, Book, FileText, Sparkles, 
  LayoutGrid, Library as LibraryIcon, X, Upload,
  ZoomIn, ZoomOut, RotateCcw, Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Toast from "@/components/Toast";
import dynamic from "next/dynamic";

const BottomNavigation = dynamic(() => import("../../components/BottomNavigation"), { ssr: false });
const PdfViewer = dynamic<{ url: string; onClose: () => void; title?: string; courseCode?: string }>(() => import("../../components/PdfViewer"), { 
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-[#E5FF66]" size={40} />
    </div>
  )
});

// --- Types ---
type Step = "welcome" | "category" | "university" | "college" | "department" | "level" | "results";

interface University {
  id: string;
  name: string;
  category: "federal" | "state" | "private";
}

interface College {
  id: string;
  name: string;
  abbreviation?: string;
}

interface Department {
  id: string;
  name: string;
  duration_years?: number;
}

interface Course {
  id: string;
  code: string;
  name: string;
}

// --- Mock Data (To be replaced by DB fetch if available) ---
const LEVELS = ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "600 Level"];

const MOCK_COURSES: Course[] = [
  { id: "c1", code: "CSC 101", name: "Introduction to Computer Science" },
  { id: "c2", code: "MTH 101", name: "Elementary Mathematics I" },
  { id: "c3", code: "PHY 101", name: "General Physics I" },
  { id: "c4", code: "GST 101", name: "Communication in English" },
];

const priorityUnis = [
  "Nnamdi Azikiwe", 
  "University of Port Harcourt", 
  "Abia State", 
  "Federal University of Technology", 
  "Michael Okpara",
  "University of Calabar"
];

export default function LibraryPage() {
  const router = useRouter();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [selectedUni, setSelectedUni] = useState<University | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<"First Semester" | "Second Semester">("First Semester");
  const [selectedCategory, setSelectedCategory] = useState<University["category"] | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentStep === "university" && selectedCategory) {
       fetchUnis(selectedCategory);
    }
  }, [currentStep, selectedCategory]);

  useEffect(() => {
    if (currentStep === "department" && selectedUni) {
       // If a college is selected, we might want to filter departments by that college
       // For now, let's keep it simple as the user will update me with department lists later.
       fetchDepartments(selectedUni.id, selectedCollege?.id);
    }
  }, [currentStep, selectedUni, selectedCollege]);

  useEffect(() => {
    if (currentStep === "college" && selectedUni) {
       fetchColleges(selectedUni.id);
    }
  }, [currentStep, selectedUni]);

  const fetchUnis = async (category: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('universities')
      .select('id, name, type')
      .eq('type', category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()) // Handle case sensitivity
      .order('name');
    
    if (!error && data) {
      setUniversities(data.map((u: any) => ({
        id: u.id,
        name: u.name,
        category: (u.type?.toLowerCase() as any) || "federal"
      })));
    }
    setIsLoading(false);
  };

  const fetchColleges = async (uniId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('colleges')
      .select('id, name, abbreviation')
      .eq('university_id', uniId)
      .order('name');
    
    if (!error && data) {
      setColleges(data);
    }
    setIsLoading(false);
  };

  const fetchDepartments = async (uniId: string, collegeId?: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('departments')
        .select('id, name, duration_years')
        .eq('university_id', uniId);
      
      if (collegeId) {
        query = query.eq('college_id', collegeId);
      }

      const { data, error } = await query.order('name');
      
      if (!error && data) {
        setDepartments(data);
      } else {
        setDepartments([]);
      }
    } catch (err) {
      console.error("Fetch departments failed:", err);
    }
    setIsLoading(false);
  };

  const handleNext = (next: Step) => setCurrentStep(next);
  const handleBack = () => {
    if (currentStep === "results") setCurrentStep("level");
    else if (currentStep === "level") setCurrentStep("department");
    else if (currentStep === "department") setCurrentStep("college");
    else if (currentStep === "college") setCurrentStep("university");
    else if (currentStep === "university") setCurrentStep("category");
    else if (currentStep === "category") setCurrentStep("welcome");
  };

  const STEPS: Step[] = ["category", "university", "college", "department", "level", "results"];
  const currentStepIndex = STEPS.indexOf(currentStep);

  return (
    <div className="min-h-screen bg-white dark:bg-black max-w-md mx-auto relative font-sans transition-colors overflow-hidden">
      {/* Header (Context-aware) */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-100/50 dark:border-zinc-800/50">
        <div className="px-6 pt-10 pb-5 flex items-center gap-4">
          {currentStep !== "welcome" && (
            <button onClick={handleBack} className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-800 active:scale-90 transition-transform">
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white uppercase italic leading-none">Library</h1>
            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mt-0.5">
              {currentStep === "results" ? selectedDept?.name : "Academic Resources"}
            </p>
          </div>
        </div>

        {/* Segmented Progress Bar */}
        {currentStepIndex >= 0 && (
          <div className="px-6 pb-4 flex gap-1.5">
            {STEPS.map((step, idx) => (
              <div 
                key={step} 
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  idx <= currentStepIndex ? "bg-[#E5FF66]" : "bg-zinc-100 dark:bg-zinc-800"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <main className="px-6 py-8 pb-32">
        <AnimatePresence mode="wait">
          {currentStep === "welcome" && (
            <LibraryWelcome onStart={() => setCurrentStep("category")} />
          )}
          {currentStep === "category" && (
            <CategorySelection 
              selectedId={selectedCategory || ""}
              onSelect={(cat) => { setSelectedCategory(cat); handleNext("university"); }} 
            />
          )}
          {currentStep === "university" && (
            <UniversitySelection 
              universities={universities} 
              isLoading={isLoading}
              selectedId={selectedUni?.id}
              onSelect={async (uni) => { 
                setSelectedUni(uni); 
                setIsLoading(true);
                const { data } = await supabase
                  .from('colleges')
                  .select('id')
                  .eq('university_id', uni.id)
                  .limit(1);
                
                setIsLoading(false);
                if (data && data.length > 0) {
                  handleNext("college");
                } else {
                  setSelectedCollege(null);
                  handleNext("department");
                }
              }} 
            />
          )}
          {currentStep === "college" && (
            <CollegeSelection 
              colleges={colleges} 
              isLoading={isLoading}
              selectedId={selectedCollege?.id}
              onSelect={(college) => { setSelectedCollege(college); handleNext("department"); }} 
              onBack={handleBack}
            />
          )}
          {currentStep === "department" && (
            <DepartmentSelection 
              departments={departments} 
              isLoading={isLoading}
              selectedId={selectedDept?.id}
              onSelect={(dept) => { setSelectedDept(dept); handleNext("level"); }} 
            />
          )}
          {currentStep === "level" && (
            <LevelSelection 
              levels={selectedDept?.duration_years ? LEVELS.slice(0, selectedDept.duration_years) : LEVELS} 
              selectedLevel={selectedLevel || ""}
              onSelect={(lvl) => { setSelectedLevel(lvl); handleNext("results"); }} 
            />
          )}
          {currentStep === "results" && (
            <ResourceHub 
              uni={selectedUni!} 
              dept={selectedDept!} 
              level={selectedLevel!} 
              semester={selectedSemester}
              onSemesterChange={setSelectedSemester}
            />
          )}
        </AnimatePresence>
      </main>

      <BottomNavigation />
    </div>
  );
}

// --- Step Components ---

function CategorySelection({ selectedId, onSelect }: { selectedId: string, onSelect: (cat: University["category"]) => void }) {
  const CATEGORIES = [
    { id: "federal", name: "Federal", icon: <School size={32} />, color: "from-blue-500/10 to-indigo-500/10", textColor: "text-blue-600 dark:text-blue-400" },
    { id: "state", name: "State", icon: <LayoutGrid size={32} />, color: "from-[#E5FF66]/10 to-emerald-500/10", textColor: "text-zinc-900 dark:text-[#E2FF3D]" },
    { id: "private", name: "Private", icon: <GraduationCap size={32} />, color: "from-purple-500/10 to-pink-500/10", textColor: "text-purple-600 dark:text-purple-400" },
  ] as const;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-10"
    >
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase italic leading-none">University Type</h2>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Select your institution category</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {CATEGORIES.map(cat => (
          <button 
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`w-full p-8 bg-zinc-50 dark:bg-zinc-900/50 border rounded-[44px] text-left transition-all active:scale-[0.98] flex items-center justify-between group hover:bg-white dark:hover:bg-zinc-900 shadow-sm hover:shadow-2xl hover:shadow-black/5 ${
              selectedId === cat.id ? "border-[#E5FF66] ring-4 ring-[#E5FF66]/10 bg-white dark:bg-zinc-900" : "border-zinc-100 dark:border-zinc-800"
            }`}
          >
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-[24px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center ${cat.textColor} shadow-inner transition-transform group-hover:rotate-12`}>
                {cat.icon}
              </div>
              <h4 className={`font-black uppercase italic text-2xl tracking-tighter ${cat.textColor}`}>{cat.name}</h4>
            </div>
            <ChevronRight className="text-zinc-300 group-hover:translate-x-1 transition-transform" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function LibraryWelcome({ onStart }: { onStart: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      className="flex flex-col items-center text-center justify-center min-h-[60vh] space-y-10"
    >
      <div className="w-28 h-28 bg-zinc-900 dark:bg-[#E5FF66] rounded-[48px] flex items-center justify-center shadow-2xl relative">
        <LibraryIcon size={52} className="text-[#E5FF66] dark:text-black" />
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-white dark:bg-black rounded-full border-[4px] border-zinc-900 dark:border-[#E5FF66] animate-pulse" />
      </div>
      <div className="space-y-4">
        <h2 className="text-[40px] font-black text-zinc-900 dark:text-white leading-[0.9] uppercase italic tracking-tighter">Your Hub for success</h2>
        <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm leading-relaxed px-6 uppercase tracking-widest">Discover past questions, academic notes, and essential resources tailored to your university.</p>
      </div>
      <button 
        onClick={onStart}
        className="w-full py-5 bg-zinc-900 dark:bg-[#E5FF66] text-white dark:text-black rounded-[32px] font-black text-lg uppercase italic tracking-tight shadow-xl shadow-black/10 transition-transform active:scale-95"
      >
        Get Started
      </button>
    </motion.div>
  );
}

function UniversitySelection({ universities, isLoading, selectedId, onSelect }: { universities: University[], isLoading: boolean, selectedId?: string, onSelect: (uni: University) => void }) {
  const [search, setSearch] = useState("");
  const sortedUniversities = [...universities].sort((a, b) => {
    const aPriority = priorityUnis.some(p => a.name.includes(p));
    const bPriority = priorityUnis.some(p => b.name.includes(p));
    
    if (aPriority && !bPriority) return -1;
    if (!aPriority && bPriority) return 1;
    return a.name.localeCompare(b.name);
  });

  const filtered = sortedUniversities.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  // Utility to add soft hyphens to long words
  const hyphenate = (str: string) => {
    return str.split(' ').map(word => 
      word.length > 10 ? word.replace(/([a-z]{4,})([a-z]{4,})/gi, '$1&shy;$2') : word
    ).join(' ');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase italic leading-none">Find your school</h2>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Select from over 150 institutions</p>
      </div>
      <div className="relative">
        <input 
          type="text" 
          placeholder="Search University..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full py-5 px-14 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[28px] text-sm font-bold focus:outline-none focus:ring-4 ring-[#E5FF66]/20 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-700 shadow-inner-sm"
        />
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
        {search && (
          <button 
            onClick={() => setSearch("")}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1,2,3].map(i => (
            <div key={i} className="h-24 bg-zinc-50 dark:bg-zinc-900 rounded-[32px] animate-pulse" />
          ))
        ) : filtered.length > 0 ? filtered.map(uni => (
          <button 
            key={uni.id}
            onClick={() => onSelect(uni)}
            className={`w-full p-6 flex items-center justify-between bg-white dark:bg-zinc-950 border rounded-[32px] text-left hover:border-[#E5FF66] transition-all group active:scale-[0.98] shadow-sm hover:shadow-xl hover:shadow-black/5 ${
              selectedId === uni.id ? "border-[#E5FF66] ring-4 ring-[#E5FF66]/10" : "border-zinc-100 dark:border-zinc-900/50"
            }`}
          >
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-300 dark:text-zinc-700 group-hover:text-[#E5FF66] transition-colors">
                  <School size={24} />
               </div>
               <div className="flex-1 min-w-0 pr-2">
                 <h4 
                   className="font-black text-zinc-900 dark:text-white uppercase text-[12px] leading-[1.3] whitespace-normal"
                   dangerouslySetInnerHTML={{ __html: hyphenate(uni.name) }}
                 />
                 <div className="flex items-center gap-2 mt-1">
                   {priorityUnis.some(p => uni.name.includes(p)) && (
                     <span className="px-1.5 py-0.5 bg-[#E5FF66] text-black text-[8px] font-black uppercase rounded-[4px] leading-none shrink-0 border border-black/10">Live</span>
                   )}
                   <p className="text-[10px] uppercase font-black tracking-widest text-[#E5FF66] opacity-60 shrink-0">{uni.category} Institution</p>
                 </div>
               </div>
            </div>
            <ChevronRight size={18} className="text-zinc-300 group-hover:text-[#E5FF66] group-hover:translate-x-1 transition-transform" />
          </button>
        )) : (
          <p className="text-center text-zinc-400 text-xs font-bold uppercase tracking-widest pt-10">No institutions found</p>
        )}
      </div>
    </motion.div>
  );
}

interface CollegeSelectionProps {
  colleges: College[];
  isLoading: boolean;
  selectedId?: string;
  onSelect: (college: College) => void;
  onBack: () => void;
}

const CollegeSelection: React.FC<CollegeSelectionProps> = ({ colleges, isLoading, selectedId, onSelect, onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase italic leading-none">Select College</h2>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Academic Divisions of MOUAU</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          [1,2,3,4].map(i => (
            <div key={i} className="h-28 bg-zinc-50 dark:bg-zinc-900 rounded-[40px] animate-pulse" />
          ))
        ) : colleges.length > 0 ? colleges.map(col => (
          <button 
            key={col.id}
            onClick={() => onSelect(col)}
            className={`w-full p-6 bg-zinc-50 dark:bg-zinc-900 border rounded-[40px] text-left hover:bg-zinc-900 dark:hover:bg-[#E5FF66] transition-all transition-transform active:scale-[0.98] shadow-sm flex items-center justify-between group hover:shadow-2xl hover:shadow-[#E5FF66]/10 ${
              selectedId === col.id ? "border-[#E5FF66] ring-4 ring-[#E5FF66]/10" : "border-zinc-100 dark:border-zinc-800"
            }`}
          >
            <div className="flex items-center gap-5">
              <div className="w-20 h-14 rounded-2xl bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-[#E2FF3D] font-black italic text-[11px] transition-transform group-hover:rotate-6 shrink-0">
                {col.abbreviation || <School size={20} />}
              </div>
              <div className="flex-1">
                <h4 className="font-black text-zinc-900 dark:text-white group-hover:text-white dark:group-hover:text-black uppercase italic text-sm leading-tight tracking-tight whitespace-normal">
                  {col.name}
                </h4>
              </div>
            </div>
            <ChevronRight size={20} className="text-zinc-300 group-hover:text-white dark:group-hover:text-black group-hover:translate-x-1 transition-transform ml-2" />
          </button>
        )) : (
          <div className="py-16 px-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-[48px] border-2 border-dashed border-zinc-100 dark:border-zinc-800 flex flex-col items-center text-center gap-8 group">
             <div className="w-24 h-24 bg-zinc-900 dark:bg-[#E5FF66] rounded-[40px] flex items-center justify-center shadow-2xl relative overflow-hidden">
                <Sparkles size={44} className="text-[#E5FF66] dark:text-black animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
             </div>
             <div className="space-y-3">
               <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase italic leading-none italic">Coming Soon</h3>
               <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] max-w-[200px] leading-relaxed mx-auto">
                 We are currently mapping the academic structure for this institution.
               </p>
             </div>
             <button 
               onClick={onBack}
               className="px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-transform"
             >
               Select Another
             </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function DepartmentSelection({ departments, isLoading, selectedId, onSelect }: { departments: Department[], isLoading: boolean, selectedId?: string, onSelect: (dept: Department) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase italic leading-none text-center">Your Department</h2>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] text-center">Refine your academic path</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1,2,3,4,5].map(i => (
            <div key={i} className="h-20 bg-zinc-50 dark:bg-zinc-900 rounded-[32px] animate-pulse" />
          ))
        ) : departments.length > 0 ? departments.map(dept => (
          <button 
            key={dept.id}
            onClick={() => onSelect(dept)}
            className={`w-full p-5 bg-zinc-50 dark:bg-zinc-900 border rounded-[32px] flex items-center justify-between group transition-all active:scale-[0.98] shadow-sm hover:shadow-xl hover:shadow-black/5 hover:border-[#E5FF66] ${
              selectedId === dept.id ? "border-[#E5FF66] ring-4 ring-[#E5FF66]/10" : "border-zinc-100 dark:border-zinc-800"
            }`}
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-[#E2FF3D] transition-colors shrink-0">
                 <Check size={18} />
              </div>
              <h4 className="font-bold text-zinc-900 dark:text-white uppercase italic text-[13px] leading-tight tracking-tight whitespace-normal pr-2 group-hover:not-italic group-hover:text-black dark:group-hover:text-[#E2FF3D] transition-all">
                {dept.name}
              </h4>
            </div>
            <ChevronRight size={18} className="text-zinc-300 group-hover:text-black dark:group-hover:text-[#E5FF66] group-hover:translate-x-1 transition-transform ml-2" />
          </button>
        )) : (
          <div className="py-20 text-center">
             <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">No departments found for this institution</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function LevelSelection({ levels, selectedLevel, onSelect }: { levels: string[], selectedLevel: string, onSelect: (lvl: string) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase italic leading-none">Select Level</h2>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Your current academic status</p>
      </div>

      <div className="space-y-3">
        {levels.map(lvl => (
          <button 
            key={lvl}
            onClick={() => onSelect(lvl)}
            className={`w-full p-6 text-center border rounded-[32px] font-black uppercase tracking-widest transition-all active:scale-95 ${
              selectedLevel === lvl 
                ? "bg-[#E5FF66] text-black border-[#E5FF66] shadow-[0_0_20px_rgba(229,255,102,0.3)]" 
                : "bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-500 hover:bg-[#E5FF66]/10 dark:hover:bg-[#E5FF66]/10 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function ResourceHub({ 
  uni, 
  dept, 
  level, 
  semester, 
  onSemesterChange 
}: { 
  uni: University, 
  dept: Department, 
  level: string, 
  semester: string,
  onSemesterChange: (s: "First Semester" | "Second Semester") => void
}) {
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingPdf, setViewingPdf] = useState<{url: string, title: string, courseCode?: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchResources() {
      if (!uni || !dept) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('academic_resources')
          .select('id, title, course_code, resource_type, file_url, university_name, department_name, level, semester')
          .eq('status', 'approved')
          .eq('university_name', uni.name)
          .eq('department_name', dept.name)
          .eq('level', level)
          .eq('semester', semester);
        
        if (error) throw error;
        setResources(data || []);
      } catch (err) {
        console.error("Library fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchResources();
  }, [uni.id, dept.id, level, semester]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-10"
    >
      {/* Header Info */}
      <div className="bg-zinc-900 dark:bg-white p-8 rounded-[48px] shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#E5FF66]/10 dark:bg-zinc-100 rounded-full blur-3xl opacity-50" />
        <div className="space-y-2 relative z-10">
          <p className="text-[10px] font-black text-[#E5FF66] dark:text-zinc-400 uppercase tracking-[0.2em] truncate">{uni.name}</p>
          <h2 className="text-3xl font-black text-white dark:text-black uppercase italic leading-[0.85] tracking-tighter">{dept.name}</h2>
          <div className="flex gap-2 pt-2">
            <span className="px-3 py-1 bg-[#E5FF66] dark:bg-zinc-900 text-black dark:text-[#E2FF3D] rounded-lg text-[10px] font-black uppercase tracking-wider shadow-md">{level}</span>
          </div>
        </div>
      </div>

      {/* Resource Search & Filter */}
      <div className="relative">
        <input 
          type="text" 
          placeholder="Filter resources (e.g. CSC 101)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-4 px-12 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-[12px] font-bold focus:outline-none focus:ring-4 ring-[#E5FF66]/10 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-700 shadow-inner-sm"
        />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
        {searchTerm && (
          <button onClick={() => setSearchTerm("")} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Semester Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-900/50 rounded-[28px] border border-zinc-200/5 dark:border-zinc-800/50 shadow-inner">
        {(["First Semester", "Second Semester"] as const).map(s => (
          <button
            key={s}
            onClick={() => onSemesterChange(s)}
            className={`flex-1 py-4 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all ${semester === s ? "bg-white dark:bg-black text-zinc-900 dark:text-[#E2FF3D] shadow-xl scale-105" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"}`}
          >
            {s}
          </button>
        ))}
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
           <h3 className="text-[14px] font-black italic uppercase tracking-widest text-zinc-900 dark:text-white">{semester} Resources</h3>
           <LayoutGrid className="text-zinc-300" size={16} />
        </div>

        <div className="space-y-4">
          {isLoading ? (
            [1,2,3].map(i => (
              <div key={i} className="h-24 bg-zinc-50 dark:bg-zinc-900/50 rounded-[38px] animate-pulse border border-zinc-100 dark:border-zinc-800" />
            ))
          ) : resources.length > 0 ? (
            resources
              .filter(r => 
                r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                r.course_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.resource_type?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(resource => (
              <div 
                key={resource.id}
                className="p-6 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-[38px] flex items-center justify-between shadow-sm group hover:shadow-xl hover:shadow-black/5 transition-all"
              >
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-600 group-hover:text-[#E2FF3D] transition-colors relative shadow-inner overflow-hidden shrink-0">
                     <FileText size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-zinc-900 dark:text-white text-[11px] uppercase tracking-widest mb-1 truncate">{resource.course_code || resource.resource_type}</h4>
                    <p className="font-black text-zinc-500 dark:text-zinc-400 text-[14px] uppercase italic tracking-tighter leading-tight truncate">{resource.title}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setViewingPdf({ url: resource.file_url, title: resource.title, courseCode: resource.course_code })}
                  className="px-6 py-3 bg-zinc-900 dark:bg-[#E5FF66] text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-90 transition-all hover:rotate-1"
                >
                  View PDF
                </button>
              </div>
            ))
          ) : (
            <div className="py-16 px-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-[48px] border-2 border-dashed border-zinc-100 dark:border-zinc-800 flex flex-col items-center text-center gap-6">
               <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center opacity-40">
                  <BookOpen size={32} className="text-zinc-400" />
               </div>
               <div className="space-y-1">
                 <h4 className="font-black text-zinc-900 dark:text-white uppercase italic">Shelf Empty</h4>
                 <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest max-w-[180px] leading-relaxed mx-auto">First to upload win! No materials found for {semester}.</p>
               </div>
            </div>
          )}
        </div>
      </section>

    {/* PDF Viewer Portal */}
    <AnimatePresence>
      {viewingPdf && (
        <PdfViewer 
          url={viewingPdf.url} 
          title={viewingPdf.title} 
          courseCode={viewingPdf.courseCode}
          onClose={() => setViewingPdf(null)} 
        />
      )}
    </AnimatePresence>

      <section className="pt-8">
        <div className="p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-[48px] border-2 border-dashed border-zinc-100 dark:border-zinc-800 flex flex-col items-center text-center gap-6 group">
          <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-[32px] flex items-center justify-center text-zinc-200 dark:text-zinc-800 group-hover:scale-110 transition-transform">
             <Upload size={40} />
          </div>
          <div className="space-y-2">
            <h4 className="font-black text-zinc-900 dark:text-white uppercase italic">Be a Hero?</h4>
            <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-600 px-6 uppercase tracking-widest">Share past questions or notes and help your peers.</p>
          </div>
          <button 
            onClick={() => router.push("/settings/contribute")}
            className="bg-zinc-900 dark:bg-zinc-100 text-[#E5FF66] dark:text-zinc-900 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            Contribute Now
          </button>
        </div>
      </section>
    </motion.div>
  );
}
