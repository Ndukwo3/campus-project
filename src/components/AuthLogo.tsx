import { GraduationCap } from 'lucide-react';

export default function AuthLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-indigo-600 p-2 rounded-lg">
        <GraduationCap className="h-6 w-6 text-white" />
      </div>
      <span className="text-2xl font-bold tracking-tight text-gray-900">
        Campus
      </span>
    </div>
  );
}
