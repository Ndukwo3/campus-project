"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Check, 
  Loader2, 
  GraduationCap, 
  BookOpen, 
  Info,
  ChevronDown,
  X,
  FileCheck
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

const LEVELS = ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "600 Level"];
const UNIVERSITY_TYPES = ["Federal", "State", "Private"];
const SEMESTERS = ["First Semester", "Second Semester"];

export default function ContributePage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lists
  const [universitiesList, setUniversitiesList] = useState<any[]>([]);
  const [divisionsList, setDivisionsList] = useState<any[]>([]); // faculties or colleges
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isFetchingDepts, setIsFetchingDepts] = useState(false);

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uniType, setUniType] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [universityName, setUniversityName] = useState("");
  const [divisionType, setDivisionType] = useState<"Faculty" | "College">("Faculty");
  const [selectedDivisionId, setSelectedDivisionId] = useState("");
  const [selectedDivisionName, setSelectedDivisionName] = useState("");
  const [department, setDepartment] = useState("");
  const [isOtherDept, setIsOtherDept] = useState(false);
  const [manualDept, setManualDept] = useState("");
  const [level, setLevel] = useState("");
  const [semester, setSemester] = useState("");

  useEffect(() => {
    async function fetchUserAndUni() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*, universities(id, name, type)")
          .eq("id", user.id)
          .single();
        
        setUserProfile(profile);
        if (profile?.universities) {
          setUniType(profile.universities.type || "Federal");
          setUniversityId(profile.universities.id);
          setUniversityName(profile.universities.name);
        }
      }
    }
    fetchUserAndUni();
  }, [supabase]);

  // Fetch universities when type changes
  useEffect(() => {
    if (uniType) {
      const fetchUnis = async () => {
        setIsFetchingData(true);
        const { data } = await supabase
          .from("universities")
          .select("id, name")
          .eq("type", uniType)
          .order("name");
        
        setUniversitiesList(data || []);
        setIsFetchingData(false);
      };
      fetchUnis();
    }
  }, [uniType, supabase]);

  // Fetch divisions (Faculties/Colleges) when university changes
  useEffect(() => {
    if (universityId) {
      const fetchDivs = async () => {
        setIsFetchingData(true);
        
        // Check for colleges first
        const { data: colleges } = await supabase
          .from("colleges")
          .select("id, name")
          .eq("university_id", universityId)
          .order("name");
        
        if (colleges && colleges.length > 0) {
          setDivisionType("College");
          setDivisionsList(colleges);
        } else {
          // If no colleges, check for faculties
          const { data: faculties } = await supabase
            .from("faculties")
            .select("id, name")
            .eq("university_id", universityId)
            .order("name");
          
          setDivisionType("Faculty");
          setDivisionsList(faculties || []);
        }
        setIsFetchingData(false);
      };
      fetchDivs();
    }
  }, [universityId, supabase]);

  // Fetch departments when faculty/college changes
  useEffect(() => {
    if (selectedDivisionId) {
      const fetchDepts = async () => {
        setIsFetchingDepts(true);
        const { data } = await supabase
          .from("departments")
          .select("id, name")
          .or(`faculty_id.eq.${selectedDivisionId},college_id.eq.${selectedDivisionId}`)
          .order("name");
        
        setDepartmentsList(data || []);
        setIsFetchingDepts(false);
      };
      fetchDepts();
    } else {
      setDepartmentsList([]);
    }
    // Always reset department selection when faculty/college changes
    setDepartment("");
    setIsOtherDept(false);
    setManualDept("");
  }, [selectedDivisionId, supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Only PDF files are allowed to be uploaded.");
        return;
      }
      if (selectedFile.size > 15 * 1024 * 1024) { // 15MB limit
        setError("File size exceeds 15MB. Please upload a smaller file.");
        return;
      }
      setFile(selectedFile);
      setError(null);
      if (!title) setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalDept = isOtherDept ? manualDept : department;
    if (!file || !title || !universityName || !level || !semester || !finalDept) {
      setError("Please fill in all mandatory fields (*) and select a file.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Upload File to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, file);

      if (uploadError) throw new Error("Failed to upload file. Please try again.");

      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath);

      // 2. Insert Record into DB
      const { error: dbError } = await supabase
        .from('academic_resources')
        .insert({
          owner_id: user.id,
          title,
          file_url: publicUrl,
          university_name: universityName,
          college_name: selectedDivisionName,
          department_name: finalDept,
          level,
          semester,
          status: 'pending',
          resource_type: 'Past Questions' // Default or extracted
        });

      if (dbError) throw dbError;

      setSuccess(true);
      setTimeout(() => router.push("/library"), 3000);
    } catch (err: any) {
      console.error("Contribution error:", err);
      setError(err.message || "An error occurred while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-[#E5FF66] rounded-full flex items-center justify-center mb-8 shadow-xl shadow-[#E5FF66]/20"
        >
          <FileCheck size={48} className="text-black" />
        </motion.div>
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-4 uppercase tracking-tight">Got it!</h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-bold max-w-xs mx-auto leading-relaxed mb-8 uppercase tracking-widest text-xs">
          Your resource has been submitted for review. Thank you for contributing to the community library!
        </p>
        <button 
          onClick={() => router.push("/settings")}
          className="px-8 py-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl font-black text-sm uppercase tracking-widest text-zinc-900 dark:text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-[100px] max-w-md mx-auto relative font-sans transition-colors">
      <div className="sticky top-0 z-40 w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-100/50 dark:border-zinc-800/50 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <h1 className="text-[17px] font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase tracking-widest text-xs">Contribute</h1>
        <div className="w-10" />
      </div>

      <main className="px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2 uppercase tracking-tight italic">
            Share <span className="text-[#E5FF66]">Knowledge</span>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
            Help your peers by uploading academic resources to the community library.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`relative group h-48 rounded-[32px] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center
              ${file 
                ? "border-[#E5FF66] bg-[#E5FF66]/5" 
                : "border-zinc-100 dark:border-zinc-800 hover:border-[#E5FF66]/50 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
          >
            {file ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-[#E5FF66] flex items-center justify-center mb-4 shadow-lg shadow-[#E5FF66]/20">
                  <FileText size={32} className="text-black" />
                </div>
                <p className="font-black text-[13px] text-zinc-900 dark:text-white truncate max-w-[200px] mb-1 italic">
                  {file.name}
                </p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB · Change file
                </p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload size={32} className="text-zinc-400 dark:text-zinc-600 group-hover:text-[#E5FF66] transition-colors" />
                </div>
                <p className="font-black text-[14px] text-zinc-900 dark:text-white mb-1 uppercase tracking-tight">Choose Resource File</p>
                <p className="text-[10px] font-bold text-[#E5FF66] uppercase tracking-widest italic">PDF DOCUMENT ONLY</p>
              </>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept=".pdf"
              onChange={handleFileChange}
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-6 pt-4">
            {/* Title */}
            <div>
              <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-600 mb-2 px-1 uppercase tracking-widest leading-none">Resource Title *</label>
              <input 
                type="text"
                placeholder="e.g. CSC 201 Exam Questions 2023"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-900 rounded-2xl px-5 py-4 text-[15px] font-bold text-zinc-900 dark:text-white outline-none border border-transparent dark:border-zinc-800 focus:border-[#E5FF66]/30 transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* University Type */}
              <div>
                <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-600 mb-2 px-1 uppercase tracking-widest leading-none">Institution Category *</label>
                <div className="relative">
                  <select 
                    value={uniType}
                    onChange={(e) => {
                      setUniType(e.target.value);
                      setUniversityId("");
                      setUniversityName("");
                    }}
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-900 rounded-2xl px-5 py-4 text-[13px] font-bold text-zinc-900 dark:text-white outline-none border border-transparent dark:border-zinc-800 focus:border-[#E5FF66]/30 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select Type</option>
                    {UNIVERSITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              {/* University Selection */}
              <div>
                <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-600 mb-2 px-1 uppercase tracking-widest leading-none">Select University *</label>
                <div className="relative">
                  <select 
                    value={universityId}
                    onChange={(e) => {
                      const selected = universitiesList.find(u => u.id === e.target.value);
                      setUniversityId(e.target.value);
                      setUniversityName(selected?.name || "");
                      setSelectedDivisionId("");
                      setSelectedDivisionName("");
                    }}
                    disabled={!uniType || isFetchingData}
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-900 rounded-2xl px-5 py-4 text-[13px] font-bold text-zinc-900 dark:text-white outline-none border border-transparent dark:border-zinc-800 focus:border-[#E5FF66]/30 transition-all appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="" disabled>{isFetchingData ? "Loading..." : "Select University"}</option>
                    {universitiesList.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Faculty / College Dropdown */}
            <div>
              <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-600 mb-2 px-1 uppercase tracking-widest leading-none">Select {divisionType} *</label>
              <div className="relative">
                <select 
                  value={selectedDivisionId}
                  onChange={(e) => {
                    const selected = divisionsList.find(d => d.id === e.target.value);
                    setSelectedDivisionId(e.target.value);
                    setSelectedDivisionName(selected?.name || "");
                  }}
                  disabled={!universityId || isFetchingData}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-900 rounded-2xl px-5 py-4 text-[13px] font-bold text-zinc-900 dark:text-white outline-none border border-transparent dark:border-zinc-800 focus:border-[#E5FF66]/30 transition-all appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="" disabled>{isFetchingData ? "Loading..." : `Select ${divisionType}`}</option>
                  {divisionsList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Level */}
              <div>
                <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-600 mb-2 px-1 uppercase tracking-widest leading-none">Level *</label>
                <div className="relative">
                  <select 
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-900 rounded-2xl px-5 py-4 text-[13px] font-bold text-zinc-900 dark:text-white outline-none border border-transparent dark:border-zinc-800 focus:border-[#E5FF66]/30 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select Level</option>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-600 mb-2 px-1 uppercase tracking-widest leading-none">Semester *</label>
                <div className="relative">
                  <select 
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-900 rounded-2xl px-5 py-4 text-[13px] font-bold text-zinc-900 dark:text-white outline-none border border-transparent dark:border-zinc-800 focus:border-[#E5FF66]/30 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select Semester</option>
                    {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Department Dropdown */}
            <div>
              <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-600 mb-2 px-1 uppercase tracking-widest leading-none">Department *</label>
              <div className="space-y-3">
                <div className="relative">
                  <select 
                    value={isOtherDept ? "other" : department}
                    onChange={(e) => {
                      if (e.target.value === "other") {
                        setIsOtherDept(true);
                        setDepartment("");
                      } else {
                        setIsOtherDept(false);
                        setDepartment(e.target.value);
                      }
                    }}
                    disabled={!selectedDivisionId || isFetchingDepts}
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-900 rounded-2xl px-5 py-4 text-[13px] font-bold text-zinc-900 dark:text-white outline-none border border-transparent dark:border-zinc-800 focus:border-[#E5FF66]/30 transition-all appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="" disabled>
                      {isFetchingDepts ? "Loading Departments..." : 
                       !selectedDivisionId ? "Select Faculty First" :
                       departmentsList.length === 0 ? "No Departments Listed" : "Select Department"}
                    </option>
                    {departmentsList.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    <option value="other">{departmentsList.length === 0 ? "+ Add My Department" : "+ Other"}</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>

                {isOtherDept && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <input 
                      type="text"
                      placeholder="Type your department name..."
                      value={manualDept}
                      onChange={(e) => setManualDept(e.target.value)}
                      required
                      className="w-full bg-zinc-50 dark:bg-zinc-900 rounded-2xl px-5 py-4 text-[15px] font-bold text-zinc-900 dark:text-white outline-none border-2 border-[#E5FF66]/50 transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 text-xs font-bold uppercase tracking-widest leading-relaxed flex items-center gap-3">
              <Info size={16} />
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-5 rounded-[24px] font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl
              ${file 
                ? "bg-[#E5FF66] text-black shadow-[#E5FF66]/20 hover:scale-[1.02] active:scale-95" 
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-700 cursor-not-allowed shadow-none"
              }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={20} />
                Submit Resource
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
