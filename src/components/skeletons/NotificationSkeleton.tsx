export default function NotificationSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div 
          key={i} 
          className="flex items-center gap-4 px-3 py-4 rounded-2xl animate-pulse"
        >
          <div className="h-12 w-12 rounded-full bg-zinc-200 shrink-0" />
          
          <div className="flex-1 min-w-0 pr-1 flex flex-col gap-2">
            <div className="h-4 bg-zinc-200 rounded-md w-3/4" />
            <div className="h-3 bg-zinc-100 rounded-md w-1/4" />
          </div>
          
          <div className="w-20 h-9 bg-zinc-100 rounded-[14px] shrink-0" />
        </div>
      ))}
    </>
  );
}
