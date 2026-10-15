import HeroDirectory from "@/components/directory/HeroDirectory";
import Footer from "@/components/Footer";
import DirectoryClient from "@/components/directory/DirectoryClient";
import { getPracticeAnimalTypes, getPractices } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export default async function DirectoryPage() {
  const [result, animalTypes] = await Promise.all([
    getPractices({ limit: 10, sort: "featured" }),
    getPracticeAnimalTypes(),
  ]);
  return (
    <div>
      <HeroDirectory />
      <DirectoryClient initialResult={result} initialAnimalTypes={animalTypes} />
      <Footer />
    </div>
  );
}
