export default function ChatListSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <div 
          key={i} 
          className="flex items-center gap-4 p-3 rounded-[28px] bg-white shadow-[0_4px_20px_rgb(0,0,0,0.02)] mb-2 animate-in fade-in zoom-in-95 duration-300"
          style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
        >
          <div className="w-[60px] h-[60px] rounded-full bg-zinc-200 animate-pulse shrink-0" />
          
          <div className="flex-1 min-w-0 pr-2 flex flex-col gap-2.5 py-2">
            <div className="flex justify-between items-center">
              <div className="w-32 h-4 bg-zinc-200 rounded-xl animate-pulse" />
              <div className="w-10 h-3 bg-zinc-100 rounded-md animate-pulse" />
            </div>
            
            <div className="w-48 h-3.5 bg-zinc-100 rounded-md animate-pulse" />
          </div>
        </div>
      ))}
    </>
  );
}
