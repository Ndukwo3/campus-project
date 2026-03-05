import TopNavigation from "@/components/TopNavigation";
import StoriesBar from "@/components/StoriesBar";
import FeedCard from "@/components/FeedCard";
import BottomNavigation from "@/components/BottomNavigation";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-[100px] max-w-md mx-auto relative shadow-sm h-full">
      {/* 
        The max-w-md and mx-auto are added to make it look like a mobile app 
        even when viewed on a wider desktop browser, 
        matching the mobile-first design in the screenshot.
      */}
      <TopNavigation />
      <StoriesBar />
      
      <main className="px-4 mt-2 mb-8">
        <FeedCard
          authorName="Chidi Obi"
          authorImage="/dummy/nigerian_avatar_2_1772720155980.png"
          timePosted="12 minutes"
          postImage="/dummy/nigerian_post_image_1772720254070.png"
          likes={212}
          comments={20}
          description="Group study under the shade at faculty! Setting things up before the GST exam next week. Wishing everyone success! 🙏"
        />
        
        <FeedCard
          authorName="Zainab Ibrahim"
          authorImage="/dummy/nigerian_avatar_6_1772720236907.png"
          timePosted="2 hours"
          postImage="/dummy/nigerian_avatar_4_1772720200827.png" // Reusing another dummy image as post image for variety
          likes={84}
          comments={5}
          description="Enjoying the beautiful campus scenery today. Keep pushing guys, we almost there!"
        />
      </main>

      {/* Bottom gap to prevent content hiding behind fixed navigation */}
      <div className="h-6"></div>

      <BottomNavigation />
    </div>
  );
}
