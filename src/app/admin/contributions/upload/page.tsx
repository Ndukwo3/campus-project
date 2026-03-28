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
  FileCheck,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

type UniversityType = "Federal" | "State" | "Private";

const LEVELS = ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "600 Level", "Postgraduate", "Graduate"];
const SEMESTERS = ["First Semester", "Second Semester"];

export default function AdminDirectUploadPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  
  // Selection Metadata (Tracking both Name and ID)
  const [uniType, setUniType] = useState<UniversityType>("Federal");
  const [selectedUni, setSelectedUni] = useState(""); // Name
  const [selectedUniId, setSelectedUniId] = useState(""); // ID
  const [selectedAcademicUnit, setSelectedAcademicUnit] = useState(""); // Name
  const [selectedAcademicUnitId, setSelectedAcademicUnitId] = useState(""); // ID
  const [selectedDept, setSelectedDept] = useState(""); // Name
  const [selectedDeptId, setSelectedDeptId] = useState(""); // ID
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSemester, setSelectedSemester] = useState(SEMESTERS[0]);

  // Data Lists
  const [universitiesList, setUniversitiesList] = useState<any[]>([]);
  const [academicUnitsList, setAcademicUnitsList] = useState<any[]>([]);
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);

  // Fetch Universities
  useEffect(() => {
    const fetchUnis = async () => {
      // Fetch all unis but only show those that have colleges or faculties linked
      const { data: faculties } = await supabase.from('faculties').select('university_id');
      const { data: colleges } = await supabase.from('colleges').select('university_id');
      
      const activeIds = Array.from(new Set([
        ...(faculties?.map((f: any) => f.university_id) || []),
        ...(colleges?.map((c: any) => c.university_id) || [])
      ])).filter(id => id !== null);

      if (activeIds.length === 0) {
        setUniversitiesList([]);
        return;
      }

      const { data, error } = await supabase
        .from('universities')
        .select('id, name')
        .eq('type', uniType)
        .in('id', activeIds)
        .order('name');
      
      if (!error && data) setUniversitiesList(data);
    };
    fetchUnis();
    setSelectedUni("");
    setSelectedAcademicUnit("");
    setSelectedDept("");
  }, [uniType]);

  // Fetch Academic Units (Faculties/Colleges)
  useEffect(() => {
    if (!selectedUni) {
      setAcademicUnitsList([]);
      return;
    }
    const fetchUnits = async () => {
      if (selectedUniId) {
        // Fetch Faculties
        const { data: faculties } = await supabase
          .from('faculties')
          .select('id, name')
          .eq('university_id', selectedUniId)
          .order('name');
        
        // Fetch Colleges
        const { data: colleges } = await supabase
          .from('colleges')
          .select('id, name')
          .eq('university_id', selectedUniId)
          .order('name'); 

        const combined = [
          ...(faculties?.map((f: any) => ({ id: f.id, name: f.name, type: 'faculty' })) || []),
          ...(colleges?.map((c: any) => ({ id: c.id, name: c.name, type: 'college' })) || [])
        ];
        
        setAcademicUnitsList(combined);
      }
    };
    fetchUnits();
    setSelectedAcademicUnit("");
    setSelectedAcademicUnitId("");
    setSelectedDept("");
    setSelectedDeptId("");
  }, [selectedUniId]);

  // Fetch Departments
  useEffect(() => {
    if (!selectedAcademicUnit) {
      setDepartmentsList([]);
      return;
    }
    const fetchDepts = async () => {
      if (!selectedAcademicUnitId) return;
      const unit = academicUnitsList.find(u => u.id === selectedAcademicUnitId);
      if (!unit) return;

      let query = supabase.from('departments').select('id, name').order('name');
      
      if (unit.type === 'faculty') {
        query = query.eq('faculty_id', unit.id);
      } else {
        query = query.eq('college_id', unit.id);
      }

      const { data, error } = await query;
      if (!error && data) setDepartmentsList(data);
    };
    fetchDepts();
    setSelectedDept("");
    setSelectedDeptId("");
  }, [selectedAcademicUnitId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Only PDF files are allowed for now.");
        return;
      }
      if (selectedFile.size > 20 * 1024 * 1024) {
        setError("File size exceeds 20MB.");
        return;
      }
      setFile(selectedFile);
      setError(null);
      if (!title) setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !selectedUni || !selectedLevel || !selectedDept) {
      setError("Please fill in all mandatory fields (*) and select a file.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Upload File
      const fileExt = file.name.split('.').pop();
      const fileName = `admin-${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, file);

      if (uploadError) throw new Error("Upload failed. Check permissions.");

      const { data: { publicUrl } } = supabase.storage.from('resources').getPublicUrl(filePath);

      // 2. Insert Record
      const { error: dbError } = await supabase
        .from('academic_resources')
        .insert({
          owner_id: user.id,
          title,
          file_url: publicUrl,
          university_id: selectedUniId,
          university_name: selectedUni,
          college_id: selectedAcademicUnitId || null,
          college_name: selectedAcademicUnit || null,
          department_id: selectedDeptId,
          department_name: selectedDept,
          level: selectedLevel,
          semester: selectedSemester,
          status: 'approved'
        });

      if (dbError) throw dbError;

      setSuccess(true);
      setTimeout(() => router.push("/admin/contributions"), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ rotate: -15, scale: 0.8, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} className="w-24 h-24 bg-[#E5FF66] rounded-full flex items-center justify-center mb-8 shadow-xl shadow-[#E5FF66]/40">
          <Zap size={48} className="text-black fill-current" />
        </motion.div>
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-4 uppercase tracking-tight italic">Live In Library!</h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-bold max-w-xs mx-auto text-[11px] uppercase tracking-widest">Material published successfully.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tight text-zinc-900 dark:text-white">Direct Upload</h2>
          <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-[11px]">Bypass queue and publish instantly.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 rounded-[40px] p-8 lg:p-12 space-y-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#E5FF66]/20" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* File Picker */}
          <div className="space-y-8">
            <div onClick={() => fileInputRef.current?.click()} className={`h-64 rounded-[40px] border-4 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-8 text-center ${file ? "border-[#E5FF66] bg-[#E5FF66]/5" : "border-zinc-100 dark:border-zinc-800 hover:border-[#E5FF66]/30 hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}>
              {file ? (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-[24px] bg-[#E5FF66] flex items-center justify-center mb-6 shadow-xl shadow-[#E5FF66]/20"><FileText size={40} className="text-black" /></div>
                  <p className="font-black text-[15px] text-zinc-900 dark:text-white truncate max-w-[240px] mb-2 uppercase italic tracking-tight">{file.name}</p>
                  <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">{(file.size / (1024 * 1024)).toFixed(2)} MB · Tap to change</p>
                </div>
              ) : (
                <>
                  <Upload size={48} className="text-zinc-200 dark:text-zinc-800 mb-6" />
                  <p className="font-black text-[16px] text-zinc-900 dark:text-white mb-2 uppercase tracking-tight">Select Official Material</p>
                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest italic text-[#E5FF66]">PDF FORMAT ONLY</p>
                </>
              )}
              <input ref={fileInputRef} type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
            </div>

            <div>
              <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3 px-1">Resources Title *</label>
              <input type="text" placeholder="Official Course Material Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-900 rounded-[24px] px-6 py-5 text-[15px] font-bold text-zinc-900 dark:text-white outline-none border border-transparent dark:border-zinc-800 focus:border-[#E5FF66]/40 transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700 shadow-inner" />
            </div>
          </div>

          {/* Academic Tree */}
          <div className="space-y-6 bg-zinc-50/50 dark:bg-zinc-900/30 p-8 rounded-[40px] border border-zinc-100 dark:border-zinc-900">
            <h3 className="font-black italic uppercase tracking-widest text-[12px] text-[#E5FF66]/60 border-b border-zinc-100 dark:border-zinc-900 pb-4 mb-6">Academic Metadata</h3>

            <div className="grid grid-cols-1 gap-6">
              {/* Type -> University */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Uni Type</label>
                  <select value={uniType} onChange={(e) => setUniType(e.target.value as UniversityType)} className="w-full bg-white dark:bg-black rounded-xl px-4 py-3 text-[13px] font-bold border border-zinc-100 dark:border-zinc-800 outline-none">
                    <option value="Federal">Federal</option>
                    <option value="State">State</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">University *</label>
                  <select 
                    value={selectedUniId} 
                    onChange={(e) => {
                      const uni = universitiesList.find(u => u.id === e.target.value);
                      setSelectedUniId(e.target.value);
                      setSelectedUni(uni?.name || "");
                    }} 
                    className="w-full bg-white dark:bg-black rounded-xl px-4 py-3 text-[13px] font-bold border border-zinc-100 dark:border-zinc-800 outline-none"
                  >
                    <option value="" disabled>Select School</option>
                    {universitiesList.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Faculty / College / School */}
              <div>
                <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Faculty / College / School of *</label>
                <select 
                  value={selectedAcademicUnitId} 
                  onChange={(e) => {
                    const unit = academicUnitsList.find(u => u.id === e.target.value);
                    setSelectedAcademicUnitId(e.target.value);
                    setSelectedAcademicUnit(unit?.name || "");
                  }} 
                  disabled={!selectedUniId} 
                  className="w-full bg-white dark:bg-black rounded-xl px-4 py-3 text-[13px] font-bold border border-zinc-100 dark:border-zinc-800 outline-none disabled:opacity-30"
                >
                  <option value="">Select Unit</option>
                  {academicUnitsList.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Department *</label>
                <select 
                  value={selectedDeptId} 
                  onChange={(e) => {
                    const dept = departmentsList.find(d => d.id === e.target.value);
                    setSelectedDeptId(e.target.value);
                    setSelectedDept(dept?.name || "");
                  }} 
                  disabled={!selectedAcademicUnitId} 
                  className="w-full bg-white dark:bg-black rounded-xl px-4 py-3 text-[13px] font-bold border border-zinc-100 dark:border-zinc-800 outline-none disabled:opacity-30"
                >
                  <option value="" disabled>Select Department</option>
                  {departmentsList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              {/* Level & Semester */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Level *</label>
                  <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="w-full bg-white dark:bg-black rounded-xl px-4 py-3 text-[13px] font-bold border border-zinc-100 dark:border-zinc-800 outline-none">
                    <option value="" disabled>Select</option>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Semester *</label>
                  <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="w-full bg-white dark:bg-black rounded-xl px-4 py-3 text-[13px] font-bold border border-zinc-100 dark:border-zinc-800 outline-none">
                    {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

            </div>

            {error && <div className="p-4 rounded-xl bg-red-500/10 text-red-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-3"><Info size={16} />{error}</div>}

            <button onClick={handleSubmit} disabled={isSubmitting || !file} className={`w-full py-6 rounded-[28px] font-black text-[13px] uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 shadow-2xl ${file ? "bg-[#E5FF66] text-black shadow-[#E5FF66]/20 hover:scale-[1.03]" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"}`}>
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Zap size={20} className="fill-current" />
                  Push Live Now
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
