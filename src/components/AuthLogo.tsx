import Image from 'next/image';

export default function AuthLogo() {
  return (
    <div className="flex items-center gap-2 group cursor-pointer">
      <div className="relative h-11 w-11 p-2.5 overflow-hidden rounded-2xl bg-black border border-zinc-200 dark:border-zinc-800 shadow-sm group-hover:scale-110 transition-transform duration-500 shrink-0">
        <div className="relative w-full h-full">
          <Image
            src="/icon-192x192.jpg"
            alt="Univas Logo"
            fill
            className="object-contain"
          />
        </div>
      </div>
      <div className="flex flex-col justify-center -space-y-2">
        <span className="text-[22px] font-black tracking-tighter text-zinc-900 dark:text-zinc-100 uppercase leading-none">
          Univas
        </span>
        <div className="origin-left scale-90">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#E5FF66] dark:text-black bg-zinc-900 dark:bg-[#E5FF66] px-1.5 py-0.5 inline-block rounded-[3px] w-fit">
            Beta
          </span>
        </div>
      </div>
    </div>
  );
}








