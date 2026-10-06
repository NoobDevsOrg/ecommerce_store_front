import DynamicHeroSlider from "../components/home/DynamicHeroSlider";
import ShowroomExperience from "../components/home/ShowroomExperience";
import HomeExperienceGate from "../components/home/HomeExperienceGate";
import Testimonials from "../components/home/Testimonials";
import { getAbsoluteSiteUrl } from "../lib/siteUrl";

const canonical = getAbsoluteSiteUrl("/");

export const metadata = {
  title: "Premium Gold & Temple Jewellery",
  description: "Discover divine temple jewellery, premium gold, and diamond collections at Sagunthala Jewellers.",
  alternates: { canonical },
  openGraph: {
    title: "Sagunthala Jewellers | Premium Gold & Temple Jewellery",
    description: "Discover divine temple jewellery, premium gold, and diamond collections at Sagunthala Jewellers.",
    url: canonical,
  },
};

export default function Home() {
  return (
    <HomeExperienceGate>
      <main className="bg-[#0f0a1a]">
        <DynamicHeroSlider />
        <Testimonials showcasePosition />
        <ShowroomExperience />
      </main>
    </HomeExperienceGate>
  );
}
