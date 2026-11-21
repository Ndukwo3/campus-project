export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-black pb-[100px] lg:pb-0 relative font-sans animate-pulse">
      {/* Header bar skeleton */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100/50 dark:border-zinc-800/50">
        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800" />
        <div className="w-20 h-4 rounded-md bg-zinc-100 dark:bg-zinc-800" />
        <div className="w-10" />
      </div>

      {/* Profile info skeleton */}
      <div className="px-6 pt-4 pb-6 flex flex-col items-center">
        {/* Avatar */}
        <div className="w-28 h-28 rounded-full bg-zinc-200 dark:bg-zinc-800 mb-4" />
        {/* Name & username */}
        <div className="w-40 h-6 rounded-md bg-zinc-200 dark:bg-zinc-800 mb-2" />
        <div className="w-32 h-4 rounded-md bg-zinc-100 dark:bg-zinc-900 mb-4" />

        {/* Buttons */}
        <div className="flex gap-4 w-full mb-6">
          <div className="flex-1 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
        </div>

        {/* Stats card */}
        <div className="w-full h-24 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100/60 dark:border-zinc-800/40 mb-6" />

        {/* Details card */}
        <div className="w-full h-36 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100/60 dark:border-zinc-800/40 mb-6" />

        {/* Tabs */}
        <div className="w-full h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 mb-6" />

        {/* Posts grid */}
        <div className="grid grid-cols-3 gap-2 w-full">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
          ))}
        </div>
      </div>
    </div>
  );
}

