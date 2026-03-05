import { GraduationCap } from 'lucide-react';

export default function AuthLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-[#E5FF66] p-2 rounded-lg">
        <GraduationCap className="h-6 w-6 text-black" />
      </div>
      <span className="text-2xl font-bold italic tracking-tight text-gray-900">
        Uni-verse
      </span>
    </div>
  );
}
