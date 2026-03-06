import Image from "next/image";
import { Plus } from "lucide-react";

const stories = [
  {
    id: "you",
    name: "You",
    image: "/dummy/nigerian_avatar_1_1772720135560.png",
    isYou: true,
    hasStory: false,
  },
  {
    id: "chidi",
    name: "Chidi",
    image: "/dummy/nigerian_avatar_2_1772720155980.png",
    isYou: false,
    hasStory: true,
    ringColor: "ring-[#E5FF66]",
  },
  {
    id: "ayo",
    name: "Ayo",
    image: "/dummy/nigerian_avatar_3_1772720174186.png",
    isYou: false,
    hasStory: true,
    ringColor: "ring-[#E5FF66]",
  },
  {
    id: "ngozi",
    name: "Ngozi",
    image: "/dummy/nigerian_avatar_4_1772720200827.png",
    isYou: false,
    hasStory: true,
    ringColor: "ring-[#E5FF66]",
  },
  {
    id: "emeka",
    name: "Emeka",
    image: "/dummy/nigerian_avatar_5_1772720218967.png",
    isYou: false,
    hasStory: true,
    ringColor: "ring-[#E5FF66]",
  },
  {
    id: "zainab",
    name: "Zainab",
    image: "/dummy/nigerian_avatar_6_1772720236907.png",
    isYou: false,
    hasStory: true,
    ringColor: "ring-[#E5FF66]",
  },
];

export default function StoriesBar() {
  return (
    <div className="w-full bg-white pt-2 pb-4">
      <div className="flex gap-4 overflow-x-auto px-4 scrollbar-hide shrink-0">
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center gap-1 shrink-0">
            <div className="relative">
              <div
                className={`flex h-[68px] w-[68px] items-center justify-center rounded-full p-1 overflow-visible ${
                  story.hasStory ? `ring-2 ring-offset-2 ${story.ringColor}` : ""
                }`}
              >
                <div className="relative h-full w-full rounded-full overflow-hidden">
                  <Image
                    src={story.image}
                    alt={story.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              {story.isYou && (
                <div className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#E5FF66] text-black">
                  <Plus size={12} strokeWidth={3} />
                </div>
              )}
            </div>
            <span className="text-xs font-medium text-black mt-1">
              {story.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
