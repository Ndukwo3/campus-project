import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  className?: string;
  size?: number;
}

export default function VerifiedBadge({ className, size = 14 }: VerifiedBadgeProps) {
  return (
    <div className={cn("inline-flex items-center justify-center text-[#E5FF66] drop-shadow-[0_0_8px_rgba(229,255,102,0.4)]", className)}>
      <CheckCircle2 size={size} strokeWidth={3} />
    </div>
  );
}
