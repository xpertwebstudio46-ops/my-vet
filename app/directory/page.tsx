import HeroDirectory from "@/components/directory/HeroDirectory";
import Footer from "@/components/Footer";
import DirectoryClient from "@/components/directory/DirectoryClient";
import { getPractices } from "@/lib/api/server";
import { toPracticeCard } from "@/lib/practice-cards";

export const dynamic = "force-dynamic";

export default async function DirectoryPage() {
  const result = await getPractices({ limit: 100, sort: "rating" });
  const practices = result.items.map(toPracticeCard);
  return (
    <div>
      <HeroDirectory />
      <DirectoryClient practices={practices} />
      <Footer />
    </div>
  );
}
