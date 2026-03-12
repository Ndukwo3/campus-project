import { ArrowLeft, User, Camera, Mail, Phone, Calendar, BookOpen, GraduationCap, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AccountSettingsPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-[100px] max-w-md mx-auto relative font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[#F8F9FA]/80 backdrop-blur-md z-10 border-b border-zinc-100">
        <Link href="/settings" className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-zinc-50 transition shadow-sm shrink-0">
          <ArrowLeft size={20} className="text-black" />
        </Link>
        <span className="font-bold text-lg tracking-tight text-black">Account Settings</span>
        <div className="w-10 h-10" /> {/* Spacer for centering */}
      </div>

      <main className="px-6 pt-6 space-y-8">
        {/* Profile Photo Section */}
        <section className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
              <User className="w-12 h-12 text-zinc-300" />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#E5FF66] rounded-full flex items-center justify-center border-2 border-white text-black shadow-sm hover:scale-105 transition-transform">
              <Camera size={14} />
            </button>
          </div>
          <p className="text-sm font-bold text-zinc-500">Change Profile Photo</p>
        </section>

        {/* Basic Info Forms */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Basic Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-zinc-600 mb-1 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  defaultValue="Ndukwo Victor"
                  className="w-full bg-white border border-zinc-200 rounded-2xl py-3.5 pl-11 pr-4 text-[15px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#E5FF66] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-zinc-600 mb-1 ml-1">Username / Handle</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">@</span>
                <input 
                  type="text" 
                  defaultValue="ndukwovictor"
                  className="w-full bg-white border border-zinc-200 rounded-2xl py-3.5 pl-9 pr-4 text-[15px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#E5FF66] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-zinc-600 mb-1 ml-1">Bio</label>
              <textarea 
                rows={3}
                placeholder="Tell us about yourself..."
                className="w-full bg-white border border-zinc-200 rounded-2xl py-3.5 px-4 text-[15px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#E5FF66] focus:border-transparent transition-all resize-none"
              ></textarea>
            </div>
          </div>
        </section>

        {/* Academic Info */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Academic Details</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-zinc-600 mb-1 ml-1">University</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <select className="w-full bg-white border border-zinc-200 rounded-2xl py-3.5 pl-11 pr-4 text-[15px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#E5FF66] focus:border-transparent transition-all appearance-none">
                  <option>Federal University of Technology, Owerri</option>
                  <option>University of Lagos</option>
                  <option>University of Ibadan</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-zinc-600 mb-1 ml-1">Department / Faculty</label>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  defaultValue="Computer Science"
                  className="w-full bg-white border border-zinc-200 rounded-2xl py-3.5 pl-11 pr-4 text-[15px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#E5FF66] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-zinc-600 mb-1 ml-1">Level</label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <select className="w-full bg-white border border-zinc-200 rounded-2xl py-3.5 pl-11 pr-4 text-[15px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#E5FF66] focus:border-transparent transition-all appearance-none text-black">
                  <option>100 Level</option>
                  <option>200 Level</option>
                  <option>300 Level</option>
                  <option>400 Level</option>
                  <option>500 Level</option>
                  <option selected>Graduate</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Private Info */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Private Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-zinc-600 mb-1 ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="tel" 
                  placeholder="+234 800 000 0000"
                  className="w-full bg-white border border-zinc-200 rounded-2xl py-3.5 pl-11 pr-4 text-[15px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#E5FF66] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-zinc-600 mb-1 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="email" 
                  placeholder="example@student.uni.edu.ng"
                  className="w-full bg-zinc-100 border border-zinc-200 rounded-2xl py-3.5 pl-11 pr-4 text-[15px] font-medium text-zinc-500 focus:outline-none cursor-not-allowed"
                  disabled
                />
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 ml-1">Email cannot be changed once registered.</p>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-zinc-600 mb-1 ml-1">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="date" 
                  className="w-full bg-white border border-zinc-200 rounded-2xl py-3.5 pl-11 pr-4 text-[15px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#E5FF66] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="pt-4 pb-8">
          <button className="w-full bg-black text-white rounded-2xl py-4 font-bold text-[15px] shadow-lg hover:bg-zinc-800 transition-colors active:scale-95">
            Save Changes
          </button>
        </div>

      </main>
    </div>
  );
}
