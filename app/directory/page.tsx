import HeroDirectory from "@/components/directory/HeroDirectory";
import Footer from "@/components/Footer";
import DirectoryClient from "@/components/directory/DirectoryClient";
import { getPracticeAnimalTypes, getPractices } from "@/lib/api/server";
import { InviteYourVet } from "@/components/practices/invite-your-vet";

export const dynamic = "force-dynamic";

export default async function DirectoryPage() {
  const [result, animalTypes] = await Promise.all([
    getPractices({ limit: 10, sort: "featured" }),
    getPracticeAnimalTypes(),
  ]);
  return (
    <div>
      <HeroDirectory />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"><InviteYourVet /></div>
      <DirectoryClient initialResult={result} initialAnimalTypes={animalTypes} />
      <Footer />
    </div>
  );
}
