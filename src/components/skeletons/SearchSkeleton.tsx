export default function SearchSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Trending Skeleton */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 rounded bg-zinc-100 animate-pulse" />
          <div className="w-32 h-5 rounded-md bg-zinc-200 animate-pulse" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-9 w-24 bg-white rounded-xl border border-zinc-50 shadow-sm animate-pulse" />
          ))}
        </div>
      </section>

      {/* Suggested Students Skeleton */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <div className="w-40 h-5 rounded-md bg-zinc-200 animate-pulse" />
          <div className="w-16 h-3 rounded-md bg-zinc-100 animate-pulse" />
        </div>
        <div className="bg-white rounded-[32px] p-2 border border-zinc-100/50 space-y-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-4 rounded-2xl">
              <div className="h-14 w-14 rounded-2xl bg-zinc-100 animate-pulse" />
              <div className="flex-1 space-y-2 pr-4">
                <div className="h-4 bg-zinc-200 rounded-md w-32" />
                <div className="h-3 bg-zinc-100 rounded-md w-48" />
              </div>
              <div className="h-10 w-10 bg-zinc-100 rounded-2xl animate-pulse" />
            </div>
          ))}
        </div>
      </section>

      {/* Univas Groups Skeleton */}
      <section>
        <div className="w-36 h-5 rounded-md bg-zinc-200 mb-4 animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-[32px] p-2 border border-zinc-100/50">
              <div className="h-32 rounded-3xl bg-zinc-100 mb-3 animate-pulse" />
              <div className="px-2 pb-2 space-y-2">
                <div className="h-4 bg-zinc-200 rounded-md w-24" />
                <div className="h-8 bg-zinc-100 rounded-xl w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
