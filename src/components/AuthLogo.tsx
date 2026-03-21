import { GraduationCap } from 'lucide-react';

export default function AuthLogo() {
  return (
    <div className="flex items-center gap-2.5 group cursor-pointer">
      <div className="bg-[#E5FF66] p-2 rounded-2xl shadow-[0_4px_15px_rgba(229,255,102,0.3)] group-hover:scale-110 transition-transform duration-500">
        <GraduationCap className="h-6 w-6 text-black" strokeWidth={2.5} />
      </div>
      <div className="flex flex-col">
        <span className="text-[20px] font-black tracking-tighter text-zinc-900 leading-none">
          Uni-verse
        </span>
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#E5FF66] bg-zinc-900 px-1 inline-block mt-0.5 rounded-[2px] w-fit">
          Beta
        </span>
      </div>
    </div>
  );
}
