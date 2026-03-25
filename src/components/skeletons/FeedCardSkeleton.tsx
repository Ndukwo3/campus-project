export default function FeedCardSkeleton() {
  return (
    <div className="bg-white rounded-[32px] p-4 sm:p-5 mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100/50">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-zinc-200 animate-pulse" />
          <div className="flex flex-col gap-2">
             <div className="w-32 h-4 bg-zinc-200 rounded-md animate-pulse" />
             <div className="w-20 h-3 bg-zinc-100 rounded-md animate-pulse" />
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center">
           <div className="w-1 h-4 bg-zinc-200 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="w-full h-4 bg-zinc-200 rounded-md animate-pulse" />
        <div className="w-5/6 h-4 bg-zinc-200 rounded-md animate-pulse" />
        <div className="w-4/6 h-4 bg-zinc-200 rounded-md animate-pulse" />
      </div>

      {/* Image Skeleton */}
      <div className="w-full rounded-[28px] aspect-[4/5] sm:aspect-square bg-zinc-100 animate-pulse border border-zinc-100 mb-4" />

      {/* Action Bar Skeleton */}
      <div className="flex items-center justify-between mt-1 px-1">
        <div className="flex items-center gap-3">
          <div className="w-20 h-10 bg-zinc-100 rounded-xl animate-pulse" />
          <div className="w-20 h-10 bg-zinc-100 rounded-xl animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-zinc-100 rounded-xl animate-pulse" />
          <div className="w-10 h-10 bg-zinc-100 rounded-xl animate-pulse" />
          <div className="w-10 h-10 bg-zinc-100 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
